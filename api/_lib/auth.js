// Cilantro v4 — shared request plumbing for the Vercel serverless functions.
//
// Security model: the browser sends the caller's Supabase access token as
// `Authorization: Bearer <jwt>`. We verify it against Supabase Auth and then run
// every query through a client that carries that same token, so Postgres RLS —
// not this file — is what ultimately decides what the caller can read or write.
// A user id in the request body is never trusted.

import { createClient } from '@supabase/supabase-js';

// Vercel exposes dashboard env vars to functions regardless of the VITE_ prefix,
// so we reuse the vars Joey has already configured. The anon key is correct here:
// it carries no privilege of its own — the caller's JWT does.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Build a Supabase client scoped to one caller's JWT. All RLS applies as them. */
function userClient(token) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    // Serverless: no cookie jar, no refresh timers, no navigator lock contention.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Verify the caller's bearer token.
 * @returns {{ supabase, user }} on success, or `{ error: { status, message } }`.
 */
export async function authenticate(req) {
  if (!isSupabaseConfigured) {
    return { error: { status: 500, message: 'Supabase is not configured on the server.' } };
  }

  const header = req.headers?.authorization || req.headers?.Authorization || '';
  const match = /^Bearer\s+(\S+)$/i.exec(String(header).trim());
  if (!match) {
    return { error: { status: 401, message: 'Missing Authorization: Bearer <token> header.' } };
  }

  const token = match[1];
  const supabase = userClient(token);

  // getUser(token) round-trips to Supabase Auth, so a forged or expired JWT fails
  // here rather than being taken at face value.
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { error: { status: 401, message: 'Invalid or expired session.' } };
  }

  return { supabase, user: data.user };
}

/**
 * Gate an endpoint on profiles.is_admin for the *authenticated* caller.
 * Expected to deny until Joey's admin flag is set — that is correct behaviour.
 */
export async function requireAdmin(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { error: { status: 403, message: 'Could not verify admin status.' } };
  }
  if (!data?.is_admin) {
    return { error: { status: 403, message: 'This endpoint is admin-only.' } };
  }
  return {};
}

/** Parse a JSON body across Vercel's parsed / string / Buffer shapes. */
export function readBody(req) {
  const body = req.body;
  if (body === undefined || body === null || body === '') return {};
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'));
    } catch {
      return null;
    }
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  if (typeof body === 'object') return body;
  return null;
}

export function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

/** Enforce POST. Returns true when the request has already been answered. */
export function rejectNonPost(req, res) {
  if (req.method === 'POST') return false;
  res.setHeader('Allow', 'POST');
  sendError(res, 405, 'Method not allowed. Use POST.');
  return true;
}

/**
 * Best-effort audit row (supabase/migrations/006_ai_pipeline.sql).
 * Never throws and never blocks a response: if 006 hasn't been applied yet, or the
 * insert is refused, the caller still gets their result. Stores counts and token
 * usage only — never prompts, never answer text, never the API key.
 */
export async function recordGeneration(supabase, row) {
  try {
    const { error } = await supabase.from('ai_generations').insert(row);
    if (error) console.warn('[audit] skipped:', error.message);
  } catch (err) {
    console.warn('[audit] skipped:', err?.message ?? 'unknown error');
  }
}
