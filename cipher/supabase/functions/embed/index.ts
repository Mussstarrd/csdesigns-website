// CIPHER — `embed` Edge Function.
//
// Proxies a lightweight sentence-embedding API for the Freshness Score.
// The client computes cosine similarity locally against cached Vault
// vectors; this function only turns text into a vector. If it is
// unreachable the client falls back to Jaccard word overlap and labels
// the score "approximate".
//
// Uses Voyage AI (Anthropic's recommended embeddings partner).
// Secrets: supabase secrets set VOYAGE_API_KEY=pa-...

const MODEL = 'voyage-3-lite';

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

  let payload: { text?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid JSON body' }, 400);
  }
  const text = String(payload.text ?? '').slice(0, 4000).trim();
  if (!text) return json({ error: 'text required' }, 400);

  const key = Deno.env.get('VOYAGE_API_KEY');
  if (!key) return json({ error: 'embeddings not configured' }, 503);

  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: [text] }),
  });
  if (!response.ok) {
    console.error('voyage error', response.status, await response.text());
    return json({ error: 'embeddings_unavailable' }, 502);
  }
  const result = await response.json();
  const vector = result?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) return json({ error: 'embeddings_bad_output' }, 502);
  return json({ vector, model: MODEL });
});
