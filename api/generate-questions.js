// POST /api/generate-questions   (admin only)
//
// Body: { count?: 1-25, vibe?: string, theme?: string, difficulty?: 1|2|3, dryRun?: boolean }
//
// Generates yes/no questions in Cilantro's house voice and lands them in
// `questions` with status='pending' + source='ai'. Nothing generated here is ever
// live content: the RLS read policy only exposes global questions once they are
// status='published', so drafts are visible to admins alone until approved.

import vibeDimensions from '../src/data/vibe-dimensions.json' with { type: 'json' };
import {
  authenticate,
  readBody,
  recordGeneration,
  rejectNonPost,
  requireAdmin,
  sendError,
} from './_lib/auth.js';
import {
  MODEL,
  ModelOutputError,
  anthropicErrorResponse,
  createJSON,
} from './_lib/anthropic.js';

// Every vibe must be a key of vibe-dimensions.json or the answer never reaches
// the radar chart. Constraining the schema by enum makes that unrepresentable.
const VIBES = Object.keys(vibeDimensions);

const MAX_COUNT = 25;
// How many existing questions to show the model as "already taken".
const DEDUPE_CONTEXT_LIMIT = 400;

const SYSTEM = `You write questions for Cilantro, a yes/no reflection app for self-discovery.

VOICE — this is the whole job:
- Calm, gentle, curious. Never judgmental, never hustle-culture, never therapy-speak.
- Second person. Literally answerable yes or no. Under ~90 characters. Ends with "?".
- Vary the stems: Did you / Have you / Are you / Do you / Is there / Would you / Can you.
- Mix timeframes: today, this week, recently, timeless.
- Nothing crisis-adjacent, nothing shaming. Wholesome mischief is welcome.

DIFFICULTY:
  1 — easy, answerable without much thought
  2 — takes a moment of honesty
  3 — a hard truth; the question has some teeth

A good question earns its yes/no: both answers should feel possible and neither
should feel like the "right" one. Avoid questions that are really statements, and
avoid anything where "no" would make someone feel small.

Write each question so it stands on its own — the reader sees only the question.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'vibe', 'difficulty', 'note'],
        properties: {
          text: { type: 'string' },
          vibe: { type: 'string', enum: VIBES },
          difficulty: { type: 'integer', enum: [1, 2, 3] },
          note: {
            type: 'string',
            description: 'One short line for the admin reviewer: why this question earns its yes/no.',
          },
        },
      },
    },
  },
};

/** Loose key for catching near-duplicates: case/punctuation/whitespace-insensitive. */
function dedupeKey(text) {
  return String(text)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickSample(items, limit) {
  if (items.length <= limit) return items;
  // Deterministic-enough spread across the bank without pulling the whole thing.
  const step = items.length / limit;
  const out = [];
  for (let i = 0; i < limit; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

export default async function handler(req, res) {
  if (rejectNonPost(req, res)) return;

  const body = readBody(req);
  if (body === null) return sendError(res, 400, 'Body must be valid JSON.');

  const { supabase, user, error: authError } = await authenticate(req);
  if (authError) return sendError(res, authError.status, authError.message);

  const { error: adminError } = await requireAdmin(supabase, user.id);
  if (adminError) return sendError(res, adminError.status, adminError.message);

  // ── Validate input ──
  const count = Math.min(Math.max(parseInt(body.count ?? 10, 10) || 10, 1), MAX_COUNT);
  const vibe = typeof body.vibe === 'string' ? body.vibe.trim() : '';
  const theme = typeof body.theme === 'string' ? body.theme.trim().slice(0, 300) : '';
  const difficulty = [1, 2, 3].includes(Number(body.difficulty)) ? Number(body.difficulty) : null;
  const dryRun = body.dryRun === true;

  if (vibe && !VIBES.includes(vibe)) {
    return sendError(res, 400, `Unknown vibe "${vibe}". It must be a key of vibe-dimensions.json.`);
  }

  try {
    // ── Existing bank, for de-duplication ──
    // As an admin the RLS read policy returns every row, including other pending
    // drafts, so we don't re-propose something already sitting in the queue.
    const { data: existingRows, error: readError } = await supabase
      .from('questions')
      .select('text, vibe')
      .limit(5000);

    if (readError) {
      return sendError(res, 502, `Could not read the existing question bank: ${readError.message}`);
    }

    const existing = existingRows ?? [];
    const existingKeys = new Set(existing.map((q) => dedupeKey(q.text)));

    // Show the model the most relevant slice: same vibe first, then a spread.
    const relevant = vibe ? existing.filter((q) => q.vibe === vibe) : [];
    const context = pickSample(
      relevant.length ? relevant : existing,
      DEDUPE_CONTEXT_LIMIT,
    ).map((q) => q.text);

    // ── Build the prompt ──
    const constraints = [
      `Write exactly ${count} new questions.`,
      vibe
        ? `Every question must use the vibe "${vibe}".`
        : `Choose the most fitting vibe for each question from this list: ${VIBES.join(', ')}.`,
      difficulty
        ? `Every question must be difficulty ${difficulty}.`
        : 'Spread the questions across difficulty 1, 2, and 3.',
      theme ? `Theme to explore: ${theme}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const avoid = context.length
      ? `\n\nThese questions already exist. Do not repeat them, and do not write a close paraphrase of any of them:\n${context.map((t) => `- ${t}`).join('\n')}`
      : '';

    const { parsed, usage } = await createJSON({
      system: SYSTEM,
      prompt: `${constraints}${avoid}`,
      schema: SCHEMA,
      effort: 'high',
    });

    // ── Post-filter: schema can't express uniqueness, so enforce it here ──
    const seen = new Set();
    const rejected = [];
    const drafts = [];

    for (const q of parsed.questions ?? []) {
      const text = String(q.text ?? '').trim();
      const key = dedupeKey(text);

      if (!text.endsWith('?')) {
        rejected.push({ text, reason: 'not a question' });
        continue;
      }
      if (existingKeys.has(key)) {
        rejected.push({ text, reason: 'duplicate of an existing question' });
        continue;
      }
      if (seen.has(key)) {
        rejected.push({ text, reason: 'duplicate within this batch' });
        continue;
      }
      seen.add(key);
      drafts.push({
        text,
        vibe: q.vibe,
        difficulty: q.difficulty,
        note: String(q.note ?? '').trim(),
      });
    }

    if (dryRun) {
      return res.status(200).json({
        status: 'preview',
        model: MODEL,
        drafts,
        rejected,
        inserted: 0,
      });
    }

    if (!drafts.length) {
      return res.status(200).json({
        status: 'pending',
        model: MODEL,
        drafts: [],
        rejected,
        inserted: 0,
        message: 'Every generated question was filtered out as a duplicate.',
      });
    }

    // ── Insert as PENDING drafts. Never published, never owned. ──
    const { data: inserted, error: insertError } = await supabase
      .from('questions')
      .insert(
        drafts.map((d) => ({
          text: d.text,
          vibe: d.vibe,
          difficulty: d.difficulty,
          source: 'ai',
          status: 'pending', // ← admin approval gate; RLS hides these from users
          owner_id: null,
        })),
      )
      .select('id, text, vibe, difficulty, status');

    if (insertError) {
      return sendError(res, 502, `Could not save drafts: ${insertError.message}`);
    }

    await recordGeneration(supabase, {
      actor_id: user.id,
      kind: 'questions',
      model: MODEL,
      request: { count, vibe: vibe || null, theme: theme || null, difficulty },
      result: { inserted: inserted?.length ?? 0, rejected: rejected.length },
      usage: usage ?? {},
      web_search_used: false,
    });

    return res.status(200).json({
      status: 'pending',
      model: MODEL,
      inserted: inserted?.length ?? 0,
      drafts: (inserted ?? []).map((row) => ({
        ...row,
        note: drafts.find((d) => d.text === row.text)?.note ?? '',
      })),
      rejected,
      message: 'Drafts saved with status="pending". They are not live until approved.',
    });
  } catch (err) {
    if (err instanceof ModelOutputError) return sendError(res, 502, err.message);
    const mapped = anthropicErrorResponse(err);
    if (mapped) return sendError(res, mapped.status, mapped.message);
    console.error('[generate-questions] unexpected:', err?.message);
    return sendError(res, 500, 'Unexpected error generating questions.');
  }
}
