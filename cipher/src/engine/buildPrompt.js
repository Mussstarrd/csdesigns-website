/**
 * Orchestrates Stage 2 + 3 for one build: groove injection → seed-audio
 * adjustment → Suno assembly (budgeted) → Mureka assembly → validation.
 * Pure and synchronous.
 */

import { applySeedAudioContext } from './seedAudio.js';
import { assembleSuno } from './promptAssembler.js';
import { assembleMureka } from './murekaFormatter.js';
import { validateSuno, validateMureka } from './validator.js';
import { buildGroove, budgetForStyle } from './groove.js';
import { renderSunoScaffold } from './structureCanon.js';

/**
 * @param interpretation validated Stage-1 object
 * @param options {
 *   artistNames, energy,
 *   seedAudio: {enabled, contains: []},
 *   groove: {style: 'pocket'|'displaced'|'forward'|null, density},
 *   budget: number (defaults from groove style),
 *   rng: injectable randomness for re-rolls
 * }
 */
export function buildPrompt(interpretation, options = {}) {
  const { artistNames = [], energy = 3, seedAudio = null, groove = null, rng = null } = options;

  let interp = { ...interpretation };

  // Groove slot (D4): descriptors lead the performance section (early
  // weight), stabilizers close it, space assignment joins percussion —
  // displaced style only (A1 scoping happens inside buildGroove).
  if (groove?.style) {
    const g = buildGroove({ style: groove.style, density: groove.density ?? 2, rng });
    interp.performance = [...g.descriptors, ...(interp.performance ?? [])];
    if (g.stabilizers) interp.performance = [...interp.performance, g.stabilizers];
    if (g.spaceAssignment.length) {
      interp.percussion_physical = [...(interp.percussion_physical ?? []), ...g.spaceAssignment];
    }
  }

  if (seedAudio?.enabled && seedAudio.contains?.length) {
    interp = applySeedAudioContext(interp, seedAudio.contains).interpretation;
  }

  const budget = options.budget ?? budgetForStyle(groove?.style);
  const suno = assembleSuno(interp, { artistNames, budget });
  const mureka = assembleMureka(interp, {
    artistNames,
    energy,
    beatSwitch: options.beatSwitch === true,
    simplifyStructure: options.simplifyStructure === true,
  });
  // Suno structure lives in the LYRICS field — structure-only scaffold,
  // never lyric content (A5/D5).
  const sunoScaffold = renderSunoScaffold({
    instrumental: interp.instrumental === true,
    grooveStyle: groove?.style ?? null,
    beatSwitch: options.beatSwitch === true,
  });

  return {
    interpretation: interp,
    grooveStyle: groove?.style ?? null,
    suno: { ...suno, lyricScaffold: sunoScaffold },
    mureka,
    sunoValidation: validateSuno({
      stylePrompt: suno.stylePrompt,
      excludeField: suno.excludeField,
      instrumental: suno.instrumental,
    }),
    murekaValidation: validateMureka(mureka),
  };
}
