/**
 * Exclusion handling — Stage 2/3.
 *
 * Hard rules (code-enforced):
 *  - Exclusions are formatted `no [element]`, comma-separated.
 *  - Hard cap at 5 items.
 *  - They are output as a SEPARATE Exclude-field string, never inside the
 *    Style prompt.
 *
 * Plus the exclusion-conflict map: a static table flagging exclude items that
 * share latent-space proximity with positive tags. Excluding something the
 * positive tags implicitly summon degrades generation quality — the UI shows
 * a warning with [Remove] / [Keep anyway].
 */

export const MAX_EXCLUSIONS = 5;

/**
 * Static conflict map. Key: a keyword found in the positive prompt content.
 * Value: exclusion keywords that sit too close to it in latent space.
 */
const CONFLICT_MAP = [
  { positive: 'boom bap', conflicts: ['sampled drums', 'sample', 'vinyl', 'dusty drums'] },
  { positive: 'trap', conflicts: ['808', 'hi-hats', 'hats', 'sub-bass', 'sub bass'] },
  { positive: 'drill', conflicts: ['sliding 808', '808', 'hi-hats'] },
  { positive: 'crunk', conflicts: ['808', 'chant', 'shout'] },
  { positive: 'g-funk', conflicts: ['synth lead', 'talkbox', 'portamento synth'] },
  { positive: 'lo-fi', conflicts: ['vinyl', 'tape hiss', 'dust', 'crackle'] },
  { positive: 'memphis', conflicts: ['cowbell', '808', 'chant'] },
  { positive: 'bounce', conflicts: ['808', 'chant', 'call and response'] },
  { positive: 'halftime', conflicts: ['slow tempo', 'sparse drums'] },
  { positive: 'piano', conflicts: ['keys', 'chords'] },
  { positive: 'soul sample', conflicts: ['vocal chops', 'chipmunk vocals', 'samples'] },
];

/**
 * Normalize a raw exclusion item to bare-element form (strips any leading
 * "no " the LLM may have included, lowercases, trims).
 */
export function normalizeExclusion(item) {
  return String(item ?? '')
    .trim()
    .replace(/^no\s+/i, '')
    .replace(/\s{2,}/g, ' ')
    .toLowerCase();
}

/**
 * Build the Exclude-field string from raw exclusion items.
 * Returns { text, items, dropped } — items are the normalized kept elements,
 * dropped is anything cut by the 5-item cap or emptied by normalization.
 */
export function formatExclusions(rawItems = []) {
  const seen = new Set();
  const items = [];
  const dropped = [];
  for (const raw of rawItems) {
    const el = normalizeExclusion(raw);
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (items.length < MAX_EXCLUSIONS) items.push(el);
    else dropped.push(el);
  }
  const text = items.map((el) => `no ${el}`).join(', ');
  return { text, items, dropped };
}

/**
 * Detect conflicts between the positive prompt content and exclusion items.
 * Returns [{ exclusion, positive, message }] for the warning UI.
 */
export function detectExclusionConflicts(positiveText, exclusionItems = []) {
  const positive = String(positiveText ?? '').toLowerCase();
  const warnings = [];
  for (const entry of CONFLICT_MAP) {
    if (!positive.includes(entry.positive)) continue;
    for (const exclusion of exclusionItems) {
      const el = normalizeExclusion(exclusion);
      if (entry.conflicts.some((c) => el.includes(c) || c.includes(el))) {
        warnings.push({
          exclusion: el,
          positive: entry.positive,
          message: `"no ${el}" sits close to "${entry.positive}" in the model's latent space — excluding it may fight your positive tags and muddy the generation.`,
        });
      }
    }
  }
  return warnings;
}
