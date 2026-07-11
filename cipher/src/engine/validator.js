/**
 * Stage 3 — Validation. Runs after assembly, locally, every time (including
 * live re-validation while the user edits prompt text on the Output screen).
 */

import { containsBannedWord, filterBannedWords } from './bannedWords.js';
import { detectExclusionConflicts, MAX_EXCLUSIONS } from './exclusions.js';
import { SUNO_HARD_CEILING, SUNO_CHAR_LIMIT, INSTRUMENTAL_TAG } from './promptAssembler.js';

// Character-counter color bands for the UI (Output screen spec).
export function charCountBand(count) {
  if (count < 900) return 'green';
  if (count <= 970) return 'yellow';
  return 'red'; // 970–990 danger zone; >990 should never happen post-assembly
}

/**
 * Validate an assembled (possibly user-edited) Suno result.
 * Returns { ok, errors, warnings, conflicts, charCount, band }.
 * Errors block copy-worthiness; warnings inform.
 */
export function validateSuno({ stylePrompt = '', excludeField = '', instrumental = false }) {
  const errors = [];
  const warnings = [];

  const charCount = stylePrompt.length;
  if (charCount > SUNO_CHAR_LIMIT) {
    errors.push(`Style prompt is ${charCount} chars — over Suno's ${SUNO_CHAR_LIMIT} limit.`);
  } else if (charCount > SUNO_HARD_CEILING) {
    warnings.push(
      `Style prompt is ${charCount} chars — inside the 10-char safety margin (${SUNO_HARD_CEILING}).`
    );
  }

  if (containsBannedWord(stylePrompt)) {
    const { hits } = filterBannedWords(stylePrompt);
    for (const hit of hits) {
      errors.push(`Banned trigger word in style prompt: "${hit.label}".`);
    }
  }

  const excludeItems = excludeField
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (excludeItems.length > MAX_EXCLUSIONS) {
    errors.push(`Exclude field has ${excludeItems.length} items — max ${MAX_EXCLUSIONS}.`);
  }
  for (const item of excludeItems) {
    if (!/^no\s+/i.test(item)) {
      warnings.push(`Exclude item "${item}" is missing the "no " prefix.`);
    }
  }

  if (instrumental && !stylePrompt.trim().toLowerCase().endsWith(INSTRUMENTAL_TAG)) {
    warnings.push('Instrumental track, but "instrumental" is not the final tag (v5.5 rule).');
  }

  const conflicts = detectExclusionConflicts(
    stylePrompt,
    excludeItems.map((i) => i.replace(/^no\s+/i, ''))
  );

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    conflicts,
    charCount,
    band: charCountBand(charCount),
  };
}

/** Validate an assembled Mureka result (lighter — no hard char limit known). */
export function validateMureka({ musicStyle = '' }) {
  const errors = [];
  if (containsBannedWord(musicStyle)) {
    const { hits } = filterBannedWords(musicStyle);
    for (const hit of hits) {
      errors.push(`Banned trigger word in music style: "${hit.label}".`);
    }
  }
  if (/\b\d{2,3}\s*BPM\b/i.test(musicStyle)) {
    errors.push('Raw BPM number in Mureka style — Mureka ignores numbers; use feel words.');
  }
  return { ok: errors.length === 0, errors, charCount: musicStyle.length };
}
