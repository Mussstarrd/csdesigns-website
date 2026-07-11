// CIPHER — `interpret` Edge Function.
//
// Proxies the Claude API for Stage 1 (Interpretation) ONLY. The model
// translates user input into structured JSON tags; it never assembles the
// final prompt — that is deterministic client code.
//
// Responsibilities:
//   1. Serve identical inputs from prompt_cache (normalized-input hash,
//      shared across all users) without an API call and without quota cost.
//   2. Enforce the free tier: 10 LLM generations / device / day (server-side,
//      atomic, via the increment_usage SQL function).
//   3. Keep ANTHROPIC_API_KEY server-side. It never ships in the app bundle.
//
// Deploy: supabase functions deploy interpret
// Secrets: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'jsr:@supabase/supabase-js@2';

const DAILY_FREE_LIMIT = 10;
const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are the interpretation stage of CIPHER, a prompt engine for AI music
generation (Suno v5.5 / Mureka V9). Convert the user's description of a beat
into structured JSON tags. You output ONLY a JSON object — no prose, no
markdown fences.

Schema (all fields required; arrays may be empty):
{
  "genre_core": string,            // core genre phrase, front-loadable
  "bpm": number | null,            // 40-220, null if unknowable
  "bpm_feel": string,              // e.g. "halftime feel" — use the word "halftime", NEVER "half-time"
  "key": string,                   // e.g. "A minor", "" if unspecified
  "key_emotion": string,           // e.g. "sinister aggressive"
  "arrangement": string[],         // structural choices
  "performance": string[],         // cadence/pocket descriptors
  "percussion_physical": string[], // PHYSICAL sensation language for drums
  "low_end": string[],
  "lead": string[],
  "room": string[],                // space/ambience
  "feeling": string[],             // emotional energy
  "exclusions": string[],          // elements to exclude, max 5, WITHOUT "no " prefix
  "instrumental": boolean,
  "vocal_direction": string | null // null when instrumental
}

Rules:
- OVER-GENERATE the descriptor arrays: provide 5-6 DISTINCT items for each of
  arrangement, performance, percussion_physical, low_end, lead, room, and
  feeling. The app samples 2-3 per build, so variety within a category is the
  point — do not pad with rephrasings of the same idea.
- Use physical-sensation language ("kick lands hard round on the one"), not
  studio jargon.
- NEVER use these trigger words (they summon unwanted genres/stock samples):
  cowbell, woodblock, reed, brass, horn, rim shot, tick, click, knock, tap,
  stick, block, clave, rim, waltz, 3/4, warm, syrupy, airy, soulful,
  breathes, swing, shuffling, natural decay, round midrange tone, hypnotic,
  looping, epic, orchestral pop, high energy synth, chiptune, boss battle,
  modern, glossy, radio-ready, chart-topping, commercial, twang, uplifting,
  roots, New Orleans, funk (bare), wah, jungle drum, half-time.
- Say "halftime" (one word). Say "swung" not "swing". Say "grouped in threes"
  not "3/4".
- NEVER include artist, celebrity, band, album, or producer names.
- Max 5 exclusions, most damaging first.
- If the input names an artist sound, translate it into sonic DNA descriptors
  using any provided decoder context.`;

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Normalize input so trivially-different phrasings share a cache entry. */
function normalizeInput(input: string, context: string): string {
  return `${input}\n---\n${context}`
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json({ ok: true });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  let payload: {
    input?: string;
    context?: string;
    deviceId?: string;
    bypassCache?: boolean;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }

  const input = String(payload.input ?? '').slice(0, 2000).trim();
  const context = String(payload.context ?? '').slice(0, 4000);
  const deviceId = String(payload.deviceId ?? '').slice(0, 100);
  if (!input) return json({ error: 'input required' }, 400);
  if (!deviceId) return json({ error: 'deviceId required' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Cache check — cached serves are free and don't touch the quota.
  // bypassCache ("New Interpretation" button) skips the read AND the write:
  // the variant costs one quota credit and must not clobber the canonical
  // cached interpretation for this input.
  const bypassCache = payload.bypassCache === true;
  const hash = await sha256(normalizeInput(input, context));
  const { data: cached } = bypassCache
    ? { data: null }
    : await supabase
        .from('prompt_cache')
        .select('interpretation, hit_count')
        .eq('input_hash', hash)
        .maybeSingle();
  if (cached) {
    supabase
      .from('prompt_cache')
      .update({ hit_count: (cached.hit_count ?? 0) + 1 })
      .eq('input_hash', hash)
      .then(() => {});
    return json({ interpretation: cached.interpretation, cached: true });
  }

  // 2. Quota — atomic increment; NULL result means the day's limit is spent.
  const { data: count, error: quotaError } = await supabase.rpc('increment_usage', {
    p_device_id: deviceId,
    p_limit: DAILY_FREE_LIMIT,
  });
  if (quotaError) return json({ error: 'quota check failed' }, 500);
  if (count == null) {
    return json({ error: 'daily_limit_reached', limit: DAILY_FREE_LIMIT }, 429);
  }

  // 3. Claude call — JSON tag extraction only.
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) return json({ error: 'server not configured' }, 500);

  const userMessage = context
    ? `Decoder context (sonic DNA for referenced sounds):\n${context}\n\nUser description:\n${input}`
    : `User description:\n${input}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000, // pooled arrays (5-6 items per category) need headroom
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('anthropic error', response.status, detail);
    return json({ error: 'llm_unavailable' }, 502);
  }

  const result = await response.json();
  const text = (result.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('');

  // Parse defensively; the client re-validates with its own schema anyway.
  let interpretation: unknown;
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    interpretation = JSON.parse(fenced ? fenced[1] : text);
  } catch {
    const brace = text.match(/\{[\s\S]*\}/);
    if (!brace) return json({ error: 'llm_bad_output' }, 502);
    try {
      interpretation = JSON.parse(brace[0]);
    } catch {
      return json({ error: 'llm_bad_output' }, 502);
    }
  }

  // 4. Cache for everyone (variants from bypassCache are not stored).
  if (!bypassCache) {
    await supabase
      .from('prompt_cache')
      .upsert({ input_hash: hash, interpretation, model: MODEL });
  }

  return json({
    interpretation,
    cached: false,
    used: count,
    remaining: Math.max(0, DAILY_FREE_LIMIT - count),
  });
});
