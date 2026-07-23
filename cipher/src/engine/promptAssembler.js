/**
 * Stage 2 — Assembly. Local, deterministic, never the LLM.
 *
 * v2 policy (docs/V2_SPEC.md):
 *  - Per-build-type character budgets (D3): pocket ~350 · standard ~600 ·
 *    displacement ~990. The 990 hard ceiling (10 under Suno's 1,000) is
 *    absolute regardless of budget.
 *  - Front-loading is global: [BPM + feel] [key + emotion] [genre_core]
 *    [instrumental, no vocals — EARLY, research-corrected from v1's
 *    final-position folklore] → arrangement → performance (groove slot
 *    lives at its head) → percussion/low-end/lead → room → feeling.
 *  - Truncation drops trailing descriptors first (feeling → room → …) and
 *    never touches the front-loaded segment.
 *  - HARD-tier word rules (server-confirmed dynamic rules) strip; WATCH and
 *    ATTRACTOR tiers warn without touching text (D1).
 *  - Artist names always scrub (product policy).
 *  - Exclusions go to the SEPARATE Exclude field (≤5) with inversion
 *    injections available via exclusions.js (A3).
 */

import {
  filterBannedWords,
  scrubArtistNames,
  containsBannedWord,
  analyzeWatchWords,
  detectAttractors,
} from './bannedWords.js';
import { formatExclusions, detectExclusionConflicts } from './exclusions.js';

export const SUNO_CHAR_LIMIT = 1000;
export const SUNO_HARD_CEILING = 990; // 10-char safety margin
export const INSTRUMENTAL_TAG = 'instrumental, no vocals';

/** Hard-filter + artist-name scrub for one descriptor string. */
function cleanDescriptor(text, artistNames, warnings) {
  const banned = filterBannedWords(text);
  banned.hits.forEach((h) => warnings.push({ type: 'hard-rule', ...h, source: text }));
  const scrubbed = scrubArtistNames(banned.text, artistNames);
  scrubbed.hits.forEach((h) => warnings.push({ type: 'artist-name', ...h, source: text }));
  return scrubbed.text;
}

/**
 * Front-loaded opening: "[BPM + feel] [key + emotion] [genre] [instrumental]".
 * Never truncated. Instrumental sits EARLY — the toggle is the real control
 * on Suno; early style-text placement is the community-supported backup.
 */
function buildFrontMatter(interp, artistNames, warnings) {
  const parts = [];
  if (interp.bpm) {
    parts.push([`${interp.bpm} BPM`, interp.bpm_feel].filter(Boolean).join(' '));
  } else if (interp.bpm_feel) {
    parts.push(interp.bpm_feel);
  }
  if (interp.key) {
    parts.push([interp.key, interp.key_emotion].filter(Boolean).join(' '));
  } else if (interp.key_emotion) {
    parts.push(interp.key_emotion);
  }
  if (interp.genre_core) parts.push(interp.genre_core);
  if (interp.instrumental === true) parts.push(INSTRUMENTAL_TAG);
  return parts
    .map((p) => cleanDescriptor(p, artistNames, warnings))
    .filter(Boolean)
    .join(', ');
}

/**
 * Assemble the Suno Style Prompt + Exclude field.
 * options: { artistNames?: string[], budget?: number }
 */
export function assembleSuno(interpretation, options = {}) {
  const interp = interpretation ?? {};
  const artistNames = options.artistNames ?? [];
  const budget = Math.min(options.budget ?? SUNO_HARD_CEILING, SUNO_HARD_CEILING);
  const warnings = [];

  const frontMatter = buildFrontMatter(interp, artistNames, warnings);

  const sections = [
    ['arrangement', interp.arrangement],
    ['performance', interp.performance],
    ['percussion', interp.percussion_physical],
    ['low_end', interp.low_end],
    ['lead', interp.lead],
    ['room', interp.room],
    ['feeling', interp.feeling],
  ];

  let descriptors = [];
  for (const [section, items] of sections) {
    for (const item of items ?? []) {
      const text = cleanDescriptor(item, artistNames, warnings);
      if (text) descriptors.push({ section, text });
    }
  }

  const join = (list) =>
    [frontMatter, ...list.map((d) => d.text)].filter(Boolean).join(', ');

  // Budgeted truncation — trailing descriptors drop first, front never does.
  const truncated = [];
  let stylePrompt = join(descriptors);
  while (stylePrompt.length > budget && descriptors.length > 0) {
    const dropped = descriptors.pop();
    truncated.push(dropped.text);
    stylePrompt = join(descriptors);
  }
  if (stylePrompt.length > SUNO_HARD_CEILING) {
    stylePrompt = stylePrompt.slice(0, SUNO_HARD_CEILING).replace(/[,\s]+$/, '');
    warnings.push({ type: 'hard-truncate', label: 'front matter exceeded ceiling', action: 'hard-truncated' });
  }

  // Final HARD sweep (dynamic rules can appear via substitution chains).
  if (containsBannedWord(stylePrompt)) {
    const swept = filterBannedWords(stylePrompt);
    swept.hits.forEach((h) => warnings.push({ type: 'hard-rule-final-sweep', ...h }));
    stylePrompt = swept.text;
  }

  // WATCH + ATTRACTOR tiers: warn on the final string, never modify it.
  for (const w of analyzeWatchWords(stylePrompt)) warnings.push({ type: 'watch', ...w });
  for (const w of detectAttractors(stylePrompt, interp.genre_core)) {
    warnings.push({ type: 'attractor', ...w });
  }

  const exclusions = formatExclusions(interp.exclusions);
  exclusions.dropped.forEach((el) =>
    warnings.push({ type: 'exclusion-cap', label: el, action: 'dropped (cap 5)' })
  );
  const conflicts = detectExclusionConflicts(stylePrompt, exclusions.items);

  return {
    stylePrompt,
    excludeField: exclusions.text,
    exclusionItems: exclusions.items,
    charCount: stylePrompt.length,
    excludeCharCount: exclusions.text.length,
    budget,
    truncated,
    warnings,
    conflicts,
    instrumental: interp.instrumental === true,
  };
}

/**
 * Re-roll descriptor picks for [REGENERATE] on deterministic paths.
 * `rng` defaults to Math.random but is injectable for tests.
 */
export function rerollDescriptors(pool = [], count = 2, rng = Math.random) {
  const items = [...pool];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, Math.min(count, items.length));
}
