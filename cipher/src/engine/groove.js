/**
 * Groove system (D4 of docs/V2_SPEC.md) — rhythm as a first-class prompt
 * slot with THREE distinct vocabularies, so every build doesn't converge on
 * the same rhythmic language (a failure observed in live sessions).
 *
 * Research-backed elements:
 *  - "pocket groove" + "behind the beat" — the biggest community-verified
 *    dial for feel.
 *  - BPM number + feel word together ("140 BPM, half-time feel") is the
 *    canonical formula; Suno honors BPM ±2-5.
 *  - Stabilizers ("constant tempo, steady groove, 4/4") prevent drift when
 *    mood words imply dynamic variation.
 *  - Space assignment (displaced builds ONLY — A1 adjudication): unclaimed
 *    rhythmic space gets filled with stock fills, so the prompt claims it.
 */

import { pickDescriptors } from './dna.js';

export const GROOVE_STYLES = {
  pocket: {
    label: 'Behind-beat pocket',
    phrases: [
      'pocket groove, drums sit behind the beat',
      'laid-back swing rhythm, hi-hat swing',
      'ghost-note shuffle feel, played not programmed',
      'drummer accents the 2 and 4, softer on verse hi-hats',
      'off-grid drum swing, dusty laid-back groove',
    ],
    space: [],
  },
  displaced: {
    label: 'Displaced anti-grid',
    phrases: [
      'rhythmically displaced hits landing ahead of and behind the grid',
      'snare fires a breath before the two, wrong on purpose',
      'one single ghost hit on the and-of-3, then nothing',
      'syncopated pattern with deliberate off-beat placement',
      'kick pattern jumps the grid, never resolves where expected',
    ],
    // Space assignment — the anti-filler hypothesis, scoped to this style.
    space: [
      'between every hit only 808 decay and silence',
      'no fills, no rolls — empty space is part of the drum pattern',
    ],
  },
  forward: {
    label: 'Forward-leaning aggressive',
    phrases: [
      'forward-leaning drive, drums push on top of the beat',
      'relentless stomping momentum, no laid-back feel',
      'urgent double-time pressure in the hats',
      'four-bar loops of unbroken forward motion',
    ],
    space: [],
  },
};

export const STABILIZERS = 'constant tempo, steady groove, 4/4';

/** "140 BPM, half-time feel" — number + feel together (community canon). */
export function bpmPhrase(bpm, halfTime = false) {
  if (!bpm) return halfTime ? 'half-time feel' : '';
  return halfTime ? `${bpm} BPM, half-time feel` : `${bpm} BPM`;
}

/**
 * Build the groove slot for a prompt.
 * @returns { descriptors: [], stabilizers: string, spaceAssignment: [] }
 */
export function buildGroove({ style = null, density = 2, rng = null } = {}) {
  const vocab = GROOVE_STYLES[style];
  if (!vocab) return { descriptors: [], stabilizers: '', spaceAssignment: [] };
  return {
    descriptors: pickDescriptors(vocab.phrases, density, rng),
    stabilizers: STABILIZERS,
    spaceAssignment: vocab.space.slice(0, density > 1 ? 2 : 1),
  };
}

/**
 * Per-build-type character budgets (D3): displacement builds legitimately
 * need more room because every element carries an address + feel; pocket
 * builds win by staying lean and front-loaded.
 */
export function budgetForStyle(style) {
  if (style === 'displaced') return 990;
  if (style === 'pocket') return 350;
  return 600;
}
