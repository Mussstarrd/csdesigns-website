/**
 * Stage 3 — Validation. Runs after assembly and live on user edits.
 *
 * v2: errors = HARD-tier violations only (over-limit, dynamic-rule words,
 * exclusion cap). WATCH/ATTRACTOR tiers surface as warnings — never blockers,
 * never silent edits (D1 of docs/V2_SPEC.md).
 */

import {
  containsBannedWord,
  filterBannedWords,
  analyzeWatchWords,
  detectAttractors,
} from './bannedWords.js';
import { detectExclusionConflicts, MAX_EXCLUSIONS } from './exclusions.js';
import { SUNO_HARD_CEILING, SUNO_CHAR_LIMIT } from './promptAssembler.js';

// Character-counter color bands for the UI (Output screen spec).
export function charCountBand(count) {
  if (count < 900) return 'green';
  if (count <= 970) return 'yellow';
  return 'red';
}

/**
 * Validate an assembled (possibly user-edited) Suno result.
 * Returns { ok, errors, warnings, conflicts, charCount, band }.
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

  // HARD tier (server-confirmed dynamic rules) blocks.
  if (containsBannedWord(stylePrompt)) {
    const { hits } = filterBannedWords(stylePrompt);
    for (const hit of hits) {
      errors.push(`Confirmed trigger word in style prompt: "${hit.label}".`);
    }
  }

  // WATCH + ATTRACTOR tiers inform.
  for (const w of analyzeWatchWords(stylePrompt)) {
    warnings.push(`Watch-list word "${w.label}" — ${w.note}. Prefix with ! to dismiss.`);
  }
  const genreGuess = stylePrompt.split(',').slice(0, 4).join(',');
  for (const w of detectAttractors(stylePrompt, genreGuess)) {
    warnings.push(`"${w.label}" pulls toward ${w.attracts}${w.note ? ` — ${w.note}` : ''}.`);
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

  // Instrumental: early placement (v2 — the final-word rule was folklore).
  if (instrumental && !/instrumental/i.test(stylePrompt.slice(0, 250))) {
    warnings.push(
      'Instrumental track, but "instrumental, no vocals" is not in the front-loaded segment — and flip the platform Instrumental toggle.'
    );
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

/** Validate an assembled Mureka result. */
export function validateMureka({ musicStyle = '' }) {
  const errors = [];
  const warnings = [];
  if (containsBannedWord(musicStyle)) {
    const { hits } = filterBannedWords(musicStyle);
    for (const hit of hits) {
      errors.push(`Confirmed trigger word in music style: "${hit.label}".`);
    }
  }
  // v2: numeric-BPM adherence on Mureka is UNVERIFIED (not disproven) —
  // downgraded from v1's hard error to an advisory.
  if (/\b\d{2,3}\s*BPM\b/i.test(musicStyle)) {
    warnings.push(
      'Numeric BPM in Mureka style — adherence is unverified; feel words are the reliable lever.'
    );
  }
  return { ok: errors.length === 0, errors, warnings, charCount: musicStyle.length };
}
