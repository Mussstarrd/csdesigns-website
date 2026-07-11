/**
 * Freshness Score — semantic, not string matching.
 *
 * "gritty boom bap" vs "dusty 90s NYC hip hop" is ~0% similar by string
 * match but ~95% similar in latent space. So freshness is computed from
 * embedding cosine similarity against the user's recent Vault entries:
 *
 *   freshness = 100 − (max cosine similarity vs last N entries × 100)
 *
 * Bands: Green 80–100 · Yellow 50–79 · Red <50.
 * When the embeddings API is unreachable we fall back to Jaccard word
 * overlap and label the score "approximate".
 */

export const FRESHNESS_DEFAULT_WINDOW = 10;

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'on', 'in', 'to', 'with', 'no',
  'over', 'under', 'as', 'at', 'by', 'for', 'is', 'its',
]);

function tokenize(text) {
  return new Set(
    String(text ?? '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  );
}

/** Jaccard word-overlap similarity, the offline fallback. */
export function jaccardSimilarity(textA, textB) {
  const a = tokenize(textA);
  const b = tokenize(textB);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

export function freshnessBand(score) {
  if (score >= 80) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

/**
 * Compute freshness of a new prompt against recent Vault entries.
 *
 * @param newEntry   { text, vector? }  — vector present when embeddings worked
 * @param recent     [{ text, vector? }] — last N Vault entries (most recent first)
 * @param window     memory window (Settings, default 10)
 * @returns { score, band, approximate, maxSimilarity }
 */
export function computeFreshness(newEntry, recent = [], window = FRESHNESS_DEFAULT_WINDOW) {
  const compared = recent.slice(0, window);
  if (compared.length === 0) {
    return { score: 100, band: 'green', approximate: false, maxSimilarity: 0 };
  }

  const canUseVectors =
    Array.isArray(newEntry?.vector) &&
    newEntry.vector.length > 0 &&
    compared.every((e) => Array.isArray(e.vector) && e.vector.length === newEntry.vector.length);

  let maxSim = 0;
  if (canUseVectors) {
    for (const entry of compared) {
      maxSim = Math.max(maxSim, cosineSimilarity(newEntry.vector, entry.vector));
    }
  } else {
    for (const entry of compared) {
      maxSim = Math.max(maxSim, jaccardSimilarity(newEntry?.text, entry.text));
    }
  }

  const score = Math.round(Math.max(0, Math.min(100, 100 - maxSim * 100)));
  return {
    score,
    band: freshnessBand(score),
    approximate: !canUseVectors,
    maxSimilarity: maxSim,
  };
}

/**
 * Should a warning fire? With "My Taste Protection" ON (default), warnings
 * fire at Yellow instead of Red — Suno's My Taste feature permanently learns
 * from repeated descriptors on the user's account.
 */
export function shouldWarnFreshness(score, myTasteProtection = true) {
  const band = freshnessBand(score);
  return myTasteProtection ? band !== 'green' : band === 'red';
}
