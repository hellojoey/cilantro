// Cilantro v4 — Claude API plumbing shared by the three AI endpoints.
//
// Two call shapes live here:
//   createJSON()  — no tools, schema-constrained JSON out. Used for question
//                   generation, daily readings, and dossier structuring.
//   research()    — server-side web search, free-form text out. Used only by the
//                   fine-print pipeline, and only to gather REAL sources.
//
// The prime directive (sources must be real, never fabricated) is enforced in
// code, not by prompting: collectSearchResults() harvests the URLs the search
// tool actually returned, and filterToRealSources() drops anything else.

import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-4-8';

let cached = null;

export function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error('ANTHROPIC_API_KEY is not set on the server.');
    err.isConfigError = true;
    throw err;
  }
  // Key is read from the environment by the SDK; it is never logged or returned.
  if (!cached) cached = new Anthropic();
  return cached;
}

/** Map SDK exceptions to a safe client-facing status. Most specific first. */
export function anthropicErrorResponse(err) {
  if (err?.isConfigError) {
    return { status: 500, message: 'AI service is not configured on the server.' };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: 'The AI service is rate limited. Try again shortly.' };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 502, message: 'AI service rejected the server credentials.' };
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return { status: 502, message: 'AI service denied the request.' };
  }
  // APIConnectionError extends APIError in this SDK — check it first.
  if (err instanceof Anthropic.APIConnectionError) {
    return { status: 504, message: 'Could not reach the AI service. Try again.' };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, message: `AI service error (HTTP ${err.status ?? 'unknown'}).` };
  }
  return null; // not ours — let the caller 500 it
}

function textOf(content) {
  return (content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

class ModelOutputError extends Error {}
export { ModelOutputError };

function assertUsable(response) {
  if (response.stop_reason === 'refusal') {
    throw new ModelOutputError('The model declined this request.');
  }
  if (response.stop_reason === 'max_tokens') {
    throw new ModelOutputError('The model response was truncated. Try a smaller batch.');
  }
}

/**
 * Schema-constrained JSON call. No tools, no prefill (400s on Opus 4.8).
 * `thinking: {type:'adaptive'}` must be explicit — omitting it disables thinking.
 */
export async function createJSON({
  system,
  prompt,
  schema,
  effort = 'high',
  maxTokens = 16000,
}) {
  const response = await anthropic().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    system,
    output_config: {
      effort,
      format: { type: 'json_schema', schema },
    },
    messages: [{ role: 'user', content: prompt }],
  });

  assertUsable(response);

  const raw = textOf(response.content);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ModelOutputError('The model returned output that was not valid JSON.');
  }
  return { parsed, usage: response.usage };
}

/**
 * Web-search research call. Returns the model's prose plus every result the
 * search tool genuinely returned.
 *
 * Server-side tools run an internal loop that can stop with `pause_turn` when it
 * hits its iteration cap; we resume by echoing the assistant turn back.
 */
export async function research({
  system,
  prompt,
  maxUses = 8,
  effort = 'xhigh',
  maxTokens = 16000,
  maxContinuations = 4,
}) {
  const messages = [{ role: 'user', content: prompt }];
  const searchResults = [];
  const transcript = [];
  const usage = { input_tokens: 0, output_tokens: 0 };
  let response;

  for (let i = 0; i <= maxContinuations; i++) {
    response = await anthropic().messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      system,
      output_config: { effort },
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: maxUses }],
      messages,
    });

    usage.input_tokens += response.usage?.input_tokens ?? 0;
    usage.output_tokens += response.usage?.output_tokens ?? 0;
    searchResults.push(...collectSearchResults(response.content));
    transcript.push(textOf(response.content));

    if (response.stop_reason !== 'pause_turn') break;
    // Resume: re-send with the paused assistant turn appended. No "continue" text.
    messages.push({ role: 'assistant', content: response.content });
  }

  assertUsable(response);

  return {
    text: transcript.join('\n').trim(),
    searchResults: dedupeByUrl(searchResults),
    usage,
  };
}

/**
 * Harvest the URLs the search tool actually returned. This is the ONLY source of
 * truth for what counts as a real citation.
 *
 * Server-tool errors arrive as HTTP 200 with `content` set to an error object
 * rather than an array — hence the Array.isArray guard.
 */
export function collectSearchResults(content) {
  const out = [];
  for (const block of content ?? []) {
    if (block.type !== 'web_search_tool_result') continue;
    if (!Array.isArray(block.content)) continue; // e.g. { error_code: 'max_uses_exceeded' }
    for (const result of block.content) {
      if (result?.type === 'web_search_result' && result.url) {
        out.push({ url: result.url, title: result.title ?? '' });
      }
    }
  }
  return out;
}

function dedupeByUrl(results) {
  const seen = new Set();
  return results.filter((r) => {
    const key = normalizeUrl(r.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Tracking junk that identifies a campaign, not a document. Stripped from both
// sides so a real citation isn't discarded just because the model carried a utm
// tag through (or dropped one the search result had).
const TRACKING_PARAMS = /^(utm_|ref_|mc_|_hs|pk_)|^(fbclid|gclid|msclkid|ref|source|spm|igshid|si|cmpid|ito)$/i;

/**
 * Canonical form for comparing a model-written URL to a search-returned one.
 * Meaningful query params (?v=, ?id=) are preserved — they select the document.
 */
export function normalizeUrl(value) {
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.replace(/\/+$/, '');
    for (const name of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(name)) url.searchParams.delete(name);
    }
    url.searchParams.sort();
    const query = url.searchParams.toString();
    return `${host}${path}${query ? `?${query}` : ''}`;
  } catch {
    return null;
  }
}

/**
 * Enforce the prime directive. Any source whose URL was not actually returned by
 * web search is dropped — a plausible-looking citation the model wrote from
 * memory is exactly the failure mode this exists to prevent.
 *
 * @returns {{ sources: Array, dropped: Array<string> }}
 */
export function filterToRealSources(candidates, searchResults) {
  const allowed = new Map(); // normalised key -> the URL search actually returned

  for (const result of searchResults ?? []) {
    const key = normalizeUrl(result?.url);
    if (key) allowed.set(key, result.url); // keep the canonical URL search gave us
  }

  const sources = [];
  const dropped = [];
  const used = new Set();

  for (const candidate of candidates ?? []) {
    // Exact match on the normalised key only. There is deliberately no
    // "close enough" fallback: matching on host+path while ignoring the query
    // would swap ?v=FABRICATED for ?v=REAL — citing a real URL for a document
    // the model invented, which is the exact failure this guard exists to stop.
    const key = normalizeUrl(candidate?.url);
    const match = key ? allowed.get(key) : undefined;

    if (!match) {
      dropped.push(candidate?.url ?? '(missing url)');
      continue;
    }
    if (used.has(match)) continue; // no duplicate perspectives on one article
    used.add(match);
    sources.push({
      title: String(candidate.title ?? '').trim(),
      publisher: String(candidate.publisher ?? '').trim(),
      url: match, // trust the search tool's URL, not the model's retyping
      perspective: String(candidate.perspective ?? '').trim(),
    });
  }

  return { sources, dropped };
}
