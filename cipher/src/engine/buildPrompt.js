/**
 * Orchestrates Stage 2 + 3 for one build: seed-audio adjustment → Suno
 * assembly → Mureka assembly → validation. Pure and synchronous — this is
 * why deterministic builds feel instant.
 */

import { applySeedAudioContext } from './seedAudio.js';
import { assembleSuno } from './promptAssembler.js';
import { assembleMureka } from './murekaFormatter.js';
import { validateSuno, validateMureka } from './validator.js';

/**
 * @param interpretation validated Stage-1 object
 * @param options { artistNames, energy, seedAudio: {enabled, contains: []} }
 * @returns { interpretation, suno, mureka, sunoValidation, murekaValidation }
 */
export function buildPrompt(interpretation, options = {}) {
  const { artistNames = [], energy = 3, seedAudio = null } = options;

  let interp = interpretation;
  if (seedAudio?.enabled && seedAudio.contains?.length) {
    interp = applySeedAudioContext(interp, seedAudio.contains).interpretation;
  }

  const suno = assembleSuno(interp, { artistNames });
  const mureka = assembleMureka(interp, { artistNames, energy });

  return {
    interpretation: interp,
    suno,
    mureka,
    sunoValidation: validateSuno({
      stylePrompt: suno.stylePrompt,
      excludeField: suno.excludeField,
      instrumental: suno.instrumental,
    }),
    murekaValidation: validateMureka(mureka),
  };
}
