// POST /api/daily-reading
//
// Body: { date?: 'YYYY-MM-DD', lookbackDays?: 1-30, force?: boolean }
//
// Produces a short reflective "reading" over the caller's own recent answers.
// The answers are read server-side under the caller's JWT — RLS ("answers own")
// means this endpoint physically cannot read anyone else's reflections, even if
// the request body claimed a different user.

import {
  authenticate,
  readBody,
  recordGeneration,
  rejectNonPost,
  sendError,
} from './_lib/auth.js';
import {
  MODEL,
  ModelOutputError,
  anthropicErrorResponse,
  createJSON,
} from './_lib/anthropic.js';

const MAX_ANSWERS = 60;
const DEFAULT_LOOKBACK_DAYS = 7;

const SYSTEM = `You write the "daily reading" for Cilantro, a yes/no reflection app.

You are given a person's recent yes/no answers. Write them a short reflection —
roughly 90 to 140 words, two short paragraphs at most.

WHAT THIS IS:
- Noticing, not analysis. Name a pattern or a tension you actually see in the data.
- Warm, plainspoken, a little wry. Talk like a thoughtful friend, not a coach.
- Address them as "you". Never use their name.

WHAT THIS IS NOT:
- Not a horoscope. Do not predict, and do not mystify.
- Not a diagnosis. No clinical language, no armchair psychology.
- Not a scoreboard. Never praise or scold a yes/no — neither answer is the good one.
- Not advice. Do not tell them what to do or assign homework.
- No hedging throat-clearing ("It seems like you might perhaps..."). Say the thing.

If the answers are too few or too scattered to show a pattern, say something small
and true about that instead of inventing a theme. An honest short reading beats a
confident invented one.

Open with the observation itself. No greeting, no title, no sign-off.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['body'],
  properties: {
    body: {
      type: 'string',
      description: 'The reading itself. Plain prose, no markdown, no title.',
    },
  },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (rejectNonPost(req, res)) return;

  const body = readBody(req);
  if (body === null) return sendError(res, 400, 'Body must be valid JSON.');

  const { supabase, user, error: authError } = await authenticate(req);
  if (authError) return sendError(res, authError.status, authError.message);

  const readingDate =
    typeof body.date === 'string' && DATE_RE.test(body.date)
      ? body.date
      : new Date().toISOString().slice(0, 10);

  if (Number.isNaN(Date.parse(readingDate))) {
    return sendError(res, 400, 'date must be a valid YYYY-MM-DD string.');
  }

  const lookbackDays = Math.min(
    Math.max(parseInt(body.lookbackDays ?? DEFAULT_LOOKBACK_DAYS, 10) || DEFAULT_LOOKBACK_DAYS, 1),
    30,
  );
  const force = body.force === true;

  try {
    // ── Idempotency: don't burn a model call regenerating today's reading ──
    const { data: existing, error: existingError } = await supabase
      .from('daily_readings')
      .select('body, created_at')
      .eq('user_id', user.id)
      .eq('reading_date', readingDate)
      .maybeSingle();

    if (existingError) {
      return sendError(res, 502, `Could not check for an existing reading: ${existingError.message}`);
    }
    if (existing && !force) {
      return res.status(200).json({
        status: 'cached',
        date: readingDate,
        body: existing.body,
        created_at: existing.created_at,
      });
    }

    // ── Read the caller's own recent answers (RLS-scoped) ──
    const since = new Date(`${readingDate}T23:59:59.999Z`);
    since.setUTCDate(since.getUTCDate() - lookbackDays);

    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('question_text, vibe, answer, garden_name, source, revisited, created_at')
      .eq('user_id', user.id) // defence in depth; RLS enforces this regardless
      .gte('created_at', since.toISOString())
      .lte('created_at', `${readingDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(MAX_ANSWERS);

    if (answersError) {
      return sendError(res, 502, `Could not read your answers: ${answersError.message}`);
    }

    if (!answers?.length) {
      return res.status(200).json({
        status: 'empty',
        date: readingDate,
        body: null,
        message: 'No answers in this window yet — answer a few questions first.',
      });
    }

    // Oldest-first reads more like a story of the week.
    const lines = [...answers]
      .reverse()
      .map((a) => {
        const where = a.garden_name ? ` [${a.garden_name}]` : '';
        const again = a.revisited ? ' (revisited)' : '';
        const day = String(a.created_at).slice(0, 10);
        return `${day} · ${a.vibe}${where} — "${a.question_text}" → ${a.answer}${again}`;
      })
      .join('\n');

    const { parsed, usage } = await createJSON({
      system: SYSTEM,
      prompt: `Here are this person's answers from the last ${lookbackDays} day(s), oldest first.\n"reflected" means they sat with the question without committing to yes or no.\n\n${lines}\n\nWrite their reading for ${readingDate}.`,
      schema: SCHEMA,
      effort: 'high',
    });

    const reading = String(parsed.body ?? '').trim();
    if (!reading) {
      return sendError(res, 502, 'The model returned an empty reading.');
    }

    // ── Persist. Requires the insert/update policy from 006. ──
    const { data: saved, error: saveError } = await supabase
      .from('daily_readings')
      .upsert(
        { user_id: user.id, reading_date: readingDate, body: reading },
        { onConflict: 'user_id,reading_date' },
      )
      .select('body, created_at')
      .maybeSingle();

    if (saveError) {
      // The reading is good even if storage refused — hand it back rather than
      // throwing away a paid model call.
      console.warn('[daily-reading] save failed:', saveError.message);
      return res.status(200).json({
        status: 'unsaved',
        date: readingDate,
        body: reading,
        message: 'Reading generated but could not be saved.',
      });
    }

    await recordGeneration(supabase, {
      actor_id: user.id,
      kind: 'daily_reading',
      model: MODEL,
      request: { date: readingDate, lookback_days: lookbackDays },
      result: { answers_considered: answers.length }, // counts only, never content
      usage: usage ?? {},
      web_search_used: false,
    });

    return res.status(200).json({
      status: 'created',
      date: readingDate,
      body: saved?.body ?? reading,
      created_at: saved?.created_at ?? null,
      answers_considered: answers.length,
    });
  } catch (err) {
    if (err instanceof ModelOutputError) return sendError(res, 502, err.message);
    const mapped = anthropicErrorResponse(err);
    if (mapped) return sendError(res, mapped.status, mapped.message);
    console.error('[daily-reading] unexpected:', err?.message);
    return sendError(res, 500, 'Unexpected error generating the reading.');
  }
}
