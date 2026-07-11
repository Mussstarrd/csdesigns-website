/**
 * Stage 2 — Assembly. Local, deterministic, never the LLM.
 *
 * Builds the final Suno strings from a validated interpretation object.
 *
 * Suno Style Prompt assembly order (Prompt Stack — locked):
 *   [BPM + feel] [key + emotion] [genre_core]
 *   → Arrangement → Performance
 *   → Percussion / Low-end / Lead (physical language)
 *   → Room → Feeling
 *   → [instrumental tag LAST if true]
 *
 * Hard rules enforced here in code:
 *   1. 990-char hard ceiling (10-char safety margin under Suno's 1,000).
 *      Truncation drops trailing feeling descriptors first and never touches
 *      the front-loaded BPM/key/genre segment.
 *   2. "instrumental" (when true) is appended at the very END — v5.5 rule.
 *   3. Exclusions go to the SEPARATE Exclude field (≤5, `no x, no y`).
 *   4. Banned trigger words are stripped/substituted; warnings logged.
 *   5. Artist/celebrity names are scrubbed against the Decoder name list.
 */

import { filterBannedWords, scrubArtistNames, containsBannedWord } from './bannedWords.js';
import { formatExclusions, detectExclusionConflicts } from './exclusions.js';

export const SUNO_CHAR_LIMIT = 1000;
export const SUNO_HARD_CEILING = 990; // 10-char safety margin
export const INSTRUMENTAL_TAG = 'instrumental';

/** Run banned-word + artist-name filters over one descriptor string. */
function cleanDescriptor(text, artistNames, warnings) {
  const banned = filterBannedWords(text);
  banned.hits.forEach((h) =>
    warnings.push({ type: 'banned-word', ...h, source: text })
  );
  const scrubbed = scrubArtistNames(banned.text, artistNames);
  scrubbed.hits.forEach((h) =>
    warnings.push({ type: 'artist-name', ...h, source: text })
  );
  return scrubbed.text;
}

/**
 * Build the front-loaded opening segment: "[BPM + feel] [key + emotion] [genre]".
 * This segment is NEVER truncated.
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
  return parts
    .map((p) => cleanDescriptor(p, artistNames, warnings))
    .filter(Boolean)
    .join(', ');
}

/**
 * Assemble the Suno Style Prompt + Exclude field.
 *
 * Returns {
 *   stylePrompt, excludeField,
 *   charCount, excludeCharCount,
 *   truncated: [dropped descriptors],
 *   warnings: [{type, label, action, source}],
 *   conflicts: [{exclusion, positive, message}],
 * }
 */
export function assembleSuno(interpretation, options = {}) {
  const interp = interpretation ?? {};
  const artistNames = options.artistNames ?? [];
  const warnings = [];

  const frontMatter = buildFrontMatter(interp, artistNames, warnings);

  // Ordered descriptor list per the locked Prompt Stack. Each entry keeps its
  // section so truncation can prefer dropping trailing "feeling" items first.
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

  const instrumental = interp.instrumental === true;
  const tail = instrumental ? INSTRUMENTAL_TAG : '';

  const join = (list) =>
    [frontMatter, ...list.map((d) => d.text), ...(tail ? [tail] : [])]
      .filter(Boolean)
      .join(', ');

  // --- Rule 1: 990-char ceiling, back-first truncation. ---
  // Drop whole descriptors from the tail of the stack (feeling sits last, so
  // it goes first) until the assembled string fits. Front matter and the
  // instrumental tag are never dropped.
  const truncated = [];
  let stylePrompt = join(descriptors);
  while (stylePrompt.length > SUNO_HARD_CEILING && descriptors.length > 0) {
    const dropped = descriptors.pop();
    truncated.push(dropped.text);
    stylePrompt = join(descriptors);
  }
  // Pathological fallback: front matter alone exceeds the ceiling.
  if (stylePrompt.length > SUNO_HARD_CEILING) {
    stylePrompt = stylePrompt.slice(0, SUNO_HARD_CEILING).replace(/[,\s]+$/, '');
    warnings.push({
      type: 'hard-truncate',
      label: 'front matter exceeded ceiling',
      action: 'hard-truncated',
    });
  }

  // --- Rule 4 final sweep: assembled string must be clean. ---
  if (containsBannedWord(stylePrompt)) {
    const swept = filterBannedWords(stylePrompt);
    swept.hits.forEach((h) =>
      warnings.push({ type: 'banned-word-final-sweep', ...h })
    );
    stylePrompt = swept.text;
  }

  // --- Rule 3: exclusions live in their own field, never the style prompt. ---
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
    truncated,
    warnings,
    conflicts,
    instrumental,
  };
}

/**
 * Re-roll descriptor picks for [REGENERATE] on deterministic paths: given the
 * DNA pools a chip selection produced, pick a different subset/order.
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
