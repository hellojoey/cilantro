// POST /api/fine-print   (admin only)
//
// Body: { questionId?: uuid, slug?: string, text?: string, vibe?: string, persist?: boolean }
//
// Builds a fine-print dossier for one question: the neutral clarifier, the longer
// "notes" layer, topic tags, related gardens, and — only where the question is
// genuinely contested — REAL cited sources.
//
// ─────────────────────────────────────────────────────────────────────────────
// PRIME DIRECTIVE: fine print informs the answer, it never argues for one.
// PRIME DIRECTIVE: sources are real or they do not exist.
//
// The second one is enforced in code, not by asking nicely. The pipeline is:
//
//   1. research()  — Claude searches the web. We keep every URL the search tool
//                    actually returned. This set is the ONLY legal citation pool.
//   2. createJSON() — a second, tool-less call structures the dossier.
//   3. filterToRealSources() — drops any source whose URL is not in the pool.
//
// A model writing a citation from memory produces a plausible-looking article
// that does not exist. Step 3 makes that unrepresentable rather than unlikely:
// if search found nothing usable, the sources array comes back empty.
// ─────────────────────────────────────────────────────────────────────────────

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
  filterToRealSources,
  research,
} from './_lib/anthropic.js';

const RESEARCH_SYSTEM = `You are researching one yes/no question from Cilantro, a reflection app, to decide whether it needs cited sources.

STEP 1 — TRIAGE. Most questions do not need sources. A question needs them only if
answering it well depends on contested matters of fact — society, ethics, health,
science — where informed people genuinely disagree and where a reader would be
better off having seen the disagreement.

Questions about the reader's own inner life, memory, taste, or imagination need NO
sources. "Would you survive a zombie apocalypse", "Did you feel at peace today",
"Do you prefer mornings" — these are not contested; they are personal. There is no
external literature that informs them, and pretending otherwise is worse than
silence.

If the question is not genuinely contested, reply with exactly:
NOT_CONTESTED — <one short line explaining why>
and stop. Do not search.

STEP 2 — RESEARCH. Only if it IS genuinely contested: use web search to find real,
readable, reputable sources that together represent the honest spread of views.
Not a balanced-sounding pair — the actual distribution. If the evidence largely
points one way, say so and do not manufacture a false counterweight. If it is
genuinely open, cover the real positions.

Report what you found: for each source, its title, publisher, exact URL, and the
perspective it brings. Then note anything a reader should understand about the
terms of the question.

Never cite from memory. Only report a source you actually retrieved via search.
If search returns nothing usable, say so plainly.`;

const STRUCTURE_SYSTEM = `You are writing the fine print for one question in Cilantro, a yes/no reflection app.

FINE PRINT'S PRIME DIRECTIVE: it informs the answer. It never argues for one.
If a reader can tell which way you lean, you have failed.

fine_print — one line, the neutral clarifier. It defines a term, or fixes the scope
or the rule, so the reader answers a well-formed question instead of guessing at
what you meant. House voice, e.g.:
  · "Peace here means calm and settled — it doesn't have to mean happy."
  · "\\"Recently\\" means the past week or so — and listening means you noticed and acted on it."
  · "Any size counts, from a small slip to something you've carried for years."
Leave it empty if the question is already self-evident. Most questions need nothing;
a clarifier that clarifies nothing is noise. Never hint at an answer, never add
encouragement, never moralise.

fine_print_notes — one or two short paragraphs of factual, attributable, neutral
background, shown behind a second "read more". Only where real background exists
and genuinely helps. Empty otherwise. Same directive: inform, never steer.

tags — 2-4 lowercase topic hashtags, no "#", hyphenate multiword (e.g. "self-growth").

related_gardens — garden ids this question thematically touches. Use only the ids
you are given. Empty is a fine answer.

sources — ONLY for genuinely contested questions, and ONLY from the verified URL
list you are given. You may not cite anything else: any URL outside that list will
be discarded, so inventing one accomplishes nothing. Copy each URL exactly. For
each, "perspective" is one short neutral line on the view that source brings.
If the list is empty, return an empty array. That is the correct, expected answer
for most questions.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['contested', 'fine_print', 'fine_print_notes', 'tags', 'related_gardens', 'sources'],
  properties: {
    contested: {
      type: 'boolean',
      description: 'True only if answering depends on genuinely contested matters of fact.',
    },
    fine_print: { type: 'string', description: 'One-line neutral clarifier, or "" if self-evident.' },
    fine_print_notes: { type: 'string', description: '1-2 short neutral paragraphs, or "".' },
    tags: { type: 'array', items: { type: 'string' } },
    related_gardens: { type: 'array', items: { type: 'string' } },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'publisher', 'url', 'perspective'],
        properties: {
          title: { type: 'string' },
          publisher: { type: 'string' },
          url: { type: 'string', description: 'Must be copied exactly from the verified URL list.' },
          perspective: { type: 'string' },
        },
      },
    },
  },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (rejectNonPost(req, res)) return;

  const body = readBody(req);
  if (body === null) return sendError(res, 400, 'Body must be valid JSON.');

  const { supabase, user, error: authError } = await authenticate(req);
  if (authError) return sendError(res, authError.status, authError.message);

  const { error: adminError } = await requireAdmin(supabase, user.id);
  if (adminError) return sendError(res, adminError.status, adminError.message);

  const questionId = typeof body.questionId === 'string' ? body.questionId.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const rawText = typeof body.text === 'string' ? body.text.trim() : '';
  const persist = body.persist === true;

  if (questionId && !UUID_RE.test(questionId)) {
    return sendError(res, 400, 'questionId must be a UUID.');
  }
  if (!questionId && !slug && !rawText) {
    return sendError(res, 400, 'Provide one of: questionId, slug, or text.');
  }

  try {
    // ── Resolve the question ──
    let question = null;

    if (questionId || slug) {
      const query = supabase.from('questions').select('id, text, vibe, slug, status');
      const { data, error } = await (questionId
        ? query.eq('id', questionId)
        : query.eq('slug', slug)
      ).maybeSingle();

      if (error) return sendError(res, 502, `Could not load the question: ${error.message}`);
      if (!data) return sendError(res, 404, 'No question matched that id or slug.');
      question = data;
    } else {
      // Ad-hoc preview for text that isn't in the bank yet. Nothing to persist to.
      question = { id: null, text: rawText, vibe: body.vibe ?? null, slug: null, status: null };
    }

    if (persist && !question.id) {
      return sendError(res, 400, 'Cannot persist: provide questionId or slug to target a row.');
    }

    // ── Garden ids, so related_gardens can only reference real gardens ──
    const { data: gardenRows } = await supabase.from('gardens').select('id, name, description');
    const gardens = gardenRows ?? [];
    const gardenIds = new Set(gardens.map((g) => g.id));

    // ── 1. Research (triage + web search) ──
    const researched = await research({
      system: RESEARCH_SYSTEM,
      prompt: `Question: "${question.text}"${question.vibe ? `\nVibe: ${question.vibe}` : ''}\n\nTriage it, then research it only if it is genuinely contested.`,
      effort: 'xhigh',
      maxUses: 8,
    });

    // Every URL search actually returned. If triage said NOT_CONTESTED, no search
    // ran, this is empty, and step 3 will therefore yield zero sources.
    const verifiedUrls = researched.searchResults;

    // ── 2. Structure the dossier (no tools, schema-constrained) ──
    const gardenList = gardens.length
      ? gardens.map((g) => `- ${g.id}: ${g.name}${g.description ? ` — ${g.description}` : ''}`).join('\n')
      : '(none available — return an empty related_gardens array)';

    const urlList = verifiedUrls.length
      ? verifiedUrls.map((r) => `- ${r.url}${r.title ? `  (${r.title})` : ''}`).join('\n')
      : '(empty — web search returned nothing usable, so sources MUST be an empty array)';

    const { parsed, usage: structureUsage } = await createJSON({
      system: STRUCTURE_SYSTEM,
      prompt: [
        `Question: "${question.text}"`,
        question.vibe ? `Vibe: ${question.vibe}` : null,
        '',
        'Research notes:',
        researched.text || '(no notes)',
        '',
        'VERIFIED URL LIST — the only URLs you may cite:',
        urlList,
        '',
        'Available gardens:',
        gardenList,
        '',
        'Write the fine-print dossier.',
      ]
        .filter((line) => line !== null)
        .join('\n'),
      schema: SCHEMA,
      effort: 'high',
    });

    // ── 3. Enforce: drop anything not backed by a real search result ──
    const { sources, dropped } = filterToRealSources(parsed.sources, verifiedUrls);

    if (dropped.length) {
      // Not fatal — the guard did its job. Worth surfacing to the reviewer.
      console.warn(`[fine-print] dropped ${dropped.length} unverified source(s).`);
    }

    const tags = [...new Set((parsed.tags ?? []).map((t) => String(t).toLowerCase().replace(/^#/, '').trim()).filter(Boolean))];
    const relatedGardens = [...new Set((parsed.related_gardens ?? []).filter((g) => gardenIds.has(g)))];

    const dossier = {
      contested: Boolean(parsed.contested) && sources.length > 0,
      fine_print: String(parsed.fine_print ?? '').trim(),
      fine_print_notes: String(parsed.fine_print_notes ?? '').trim(),
      tags,
      related_gardens: relatedGardens,
      fine_print_sources: sources,
    };

    const usage = {
      research: researched.usage,
      structure: structureUsage ?? {},
    };

    // ── Default is review-first: return the dossier, write nothing ──
    if (!persist) {
      return res.status(200).json({
        status: 'preview',
        model: MODEL,
        question: { id: question.id, text: question.text, slug: question.slug },
        dossier,
        verified_urls_found: verifiedUrls.length,
        sources_dropped: dropped.length,
        message: 'Preview only. Re-send with persist:true to write this to the question.',
      });
    }

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        fine_print: dossier.fine_print || null,
        fine_print_notes: dossier.fine_print_notes || null,
        tags: dossier.tags,
        related_gardens: dossier.related_gardens,
        fine_print_sources: dossier.fine_print_sources,
      })
      .eq('id', question.id);

    if (updateError) {
      return sendError(res, 502, `Could not save the fine print: ${updateError.message}`);
    }

    await recordGeneration(supabase, {
      actor_id: user.id,
      kind: 'fine_print',
      model: MODEL,
      target_question_id: question.id,
      request: { question_id: question.id, slug: question.slug },
      result: {
        contested: dossier.contested,
        sources_kept: sources.length,
        sources_dropped: dropped.length,
        verified_urls_found: verifiedUrls.length,
        tags: dossier.tags.length,
      },
      usage,
      web_search_used: verifiedUrls.length > 0,
    });

    return res.status(200).json({
      status: 'saved',
      model: MODEL,
      question: { id: question.id, text: question.text, slug: question.slug },
      dossier,
      verified_urls_found: verifiedUrls.length,
      sources_dropped: dropped.length,
    });
  } catch (err) {
    if (err instanceof ModelOutputError) return sendError(res, 502, err.message);
    const mapped = anthropicErrorResponse(err);
    if (mapped) return sendError(res, mapped.status, mapped.message);
    console.error('[fine-print] unexpected:', err?.message);
    return sendError(res, 500, 'Unexpected error building the fine print.');
  }
}
