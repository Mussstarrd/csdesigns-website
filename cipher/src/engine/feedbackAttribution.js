/**
 * The Learning System — deterministic trigger-word attribution.
 *
 * CIPHER's static kill list encodes known trigger words, but the platforms'
 * latent space has traps nobody has documented yet. This module turns user
 * feedback on real generations into evidence:
 *
 *   1. Every rated generation links its prompt terms to an outcome
 *      (fire / ok / trash + structured issue tags).
 *   2. Each term accumulates good/bad counts across events.
 *   3. Terms that keep appearing in bad generations — especially ones
 *      co-occurring with a named unwanted element — surface as SUSPECTS.
 *
 * Suspects are shown locally (Settings → Trigger Lab) and synced to
 * Supabase where evidence aggregates across all users. The owner promotes
 * confirmed suspects to dynamic kill-list rules (dynamic_rules table),
 * which ship to every device without an app release.
 *
 * Everything here is pure and unit-tested — no LLM, no fuzzy matching.
 */

export const RATINGS = ['fire', 'ok', 'trash'];

export const ISSUE_TAGS = [
  { id: 'unwanted_element', label: 'Unwanted instrument/sound appeared' },
  { id: 'genre_drift', label: 'Pulled toward the wrong genre' },
  { id: 'muddy_mix', label: 'Muddy low end / weak dynamics' },
  { id: 'ignored_exclusion', label: 'Ignored an exclusion' },
  { id: 'vocal_leak', label: 'Vocals on an instrumental' },
  { id: 'structure_ignored', label: 'Ignored the structure block' },
  { id: 'too_generic', label: 'Generic / ignored the descriptors' },
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'on', 'in', 'to', 'with', 'no', 'not',
  'over', 'under', 'as', 'at', 'by', 'for', 'is', 'its', 'into', 'like',
  'then', 'than', 'one', 'two', 'between', 'every', 'each', 'out', 'up',
  'down', 'from', 'bpm', 'instrumental',
]);

/**
 * Extract candidate terms from a prompt: unigrams and bigrams, lowercased,
 * stopword-filtered. Bigrams matter — "music box" may trigger where neither
 * word does alone.
 *
 * Extraction is scoped WITHIN comma-delimited descriptor segments (Gemini
 * review): bigrams never span two descriptors, so one bad generation smears
 * blame across far fewer spurious terms.
 */
export function extractTerms(promptText) {
  const terms = new Set();
  for (const segment of String(promptText ?? '').split(',')) {
    const words = segment
      .toLowerCase()
      .split(/[^a-z0-9'-]+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
    for (const w of words) terms.add(w);
    for (let i = 0; i < words.length - 1; i++) {
      terms.add(`${words[i]} ${words[i + 1]}`);
    }
  }
  return [...terms];
}

/** An event is "bad evidence" if rated trash, or ok-with-issues. */
export function isBadOutcome(event) {
  if (event.rating === 'trash') return true;
  return event.rating !== 'fire' && (event.issues?.length ?? 0) > 0;
}

/**
 * Score suspect terms from a list of feedback events.
 *
 * Each event: { promptText, rating, issues: [], unwantedText? }
 *
 * Returns [{ term, bad, good, total, suspicion, summons }] sorted by
 * suspicion desc — only terms seen at least `minOccurrences` times.
 * `suspicion` uses a Laplace-smoothed bad ratio so a term seen 3/3 bad
 * doesn't read as a mathematically certain 1.0 on tiny evidence.
 * `summons` counts events where the term co-occurred with a NAMED unwanted
 * element — the strongest evidence class ("every time 'velvet' is in the
 * prompt, saxophone shows up").
 */
export function scoreSuspects(events = [], { minOccurrences = 3 } = {}) {
  const stats = new Map(); // term -> {bad, good, summons}
  for (const event of events) {
    const bad = isBadOutcome(event);
    const named = bad && event.issues?.includes('unwanted_element') && event.unwantedText;
    for (const term of extractTerms(event.promptText)) {
      if (!stats.has(term)) stats.set(term, { bad: 0, good: 0, summons: 0 });
      const s = stats.get(term);
      if (bad) {
        s.bad++;
        if (named) s.summons++;
      } else if (event.rating === 'fire') {
        s.good++;
      }
      // 'ok' with no issues is neutral — counts toward total only.
    }
  }

  const out = [];
  for (const [term, s] of stats) {
    const total = s.bad + s.good;
    // Cold-start rule (Gemini review): a term that co-occurred with a NAMED
    // unwanted element counts from its first occurrence — explicit user
    // evidence beats the statistical minimum.
    if (total < minOccurrences && s.summons < 1) continue;
    const suspicion = (s.bad + 1) / (total + 2); // Laplace smoothing
    out.push({ term, bad: s.bad, good: s.good, total, suspicion, summons: s.summons });
  }
  return out.sort(
    (a, b) => b.summons - a.summons || b.suspicion - a.suspicion || b.total - a.total
  );
}

/**
 * Classify a scored suspect for the Trigger Lab UI.
 *   hard-trigger : overwhelmingly bad, or repeatedly summons a named element
 *   watch        : leaning bad, needs more evidence
 *   clear        : evidence says it's fine
 */
export function classifySuspect({ suspicion, total, summons }) {
  if ((summons >= 2 && suspicion >= 0.6) || (suspicion >= 0.8 && total >= 4)) {
    return 'hard-trigger';
  }
  if (suspicion >= 0.55) return 'watch';
  // Cold-start: a named-offender co-occurrence promotes to watch, but only
  // while evidence is scarce or leaning bad — it must not override a term
  // that repeatedly appears in fire generations.
  if (summons >= 1 && (total < 3 || suspicion >= 0.5)) return 'watch';
  return 'clear';
}

/**
 * Filter scored suspects down to what the Trigger Lab shows / syncs:
 * hard-trigger and watch terms that are not already on the static kill list
 * (checked by the caller via containsBannedWord to avoid a circular import).
 */
export function suspectReport(events, options) {
  return scoreSuspects(events, options)
    .map((s) => ({ ...s, verdict: classifySuspect(s) }))
    .filter((s) => s.verdict !== 'clear');
}
