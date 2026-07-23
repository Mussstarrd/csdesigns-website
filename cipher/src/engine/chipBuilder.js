/**
 * Build It — chip selections → interpretation. Fully deterministic, no LLM.
 * This is the unlimited free-tier path; it must feel instant (<100ms).
 *
 * Merge precedence:
 *   ARTIST SOUND (a full artist_dna row) is the base when selected.
 *   REGION-ERA fills structural gaps (genre, BPM, key, percussion, low end).
 *   VIBE adds feeling + key emotion.
 *   PRODUCTION STYLE adds arrangement/performance/room.
 *   Fine-Tune Overrides win over everything.
 */

import { emptyInterpretation, validateInterpretation } from './interpretationSchema.js';
import { dnaToInterpretation, pickDescriptors } from './dna.js';

export function buildFromChips(
  { artistDna = null, regionChip = null, vibeChip = null, productionChip = null } = {},
  overrides = {},
  rng = null
) {
  // Base: artist DNA when chosen, otherwise an empty frame.
  let interp = artistDna
    ? dnaToInterpretation(artistDna, overrides, rng)
    : { ...emptyInterpretation(), instrumental: overrides.instrumental !== false };

  if (regionChip) {
    interp = {
      ...interp,
      genre_core: interp.genre_core || regionChip.genre,
      bpm:
        overrides.bpm ??
        interp.bpm ??
        Math.round((regionChip.bpm_min + regionChip.bpm_max) / 2),
      bpm_feel: interp.bpm_feel || (regionChip.bpm_min >= 130 ? 'half-time feel' : ''),
      key: overrides.key ?? interp.key ?? regionChip.key_preference,
      percussion_physical: interp.percussion_physical.length
        ? interp.percussion_physical
        : pickDescriptors(regionChip.percussion_dna, 2, rng),
      low_end: interp.low_end.length
        ? interp.low_end
        : pickDescriptors(regionChip.low_end_dna, 2, rng),
      room: interp.room.length ? interp.room : pickDescriptors(regionChip.room_dna, 1, rng),
    };
  }

  if (vibeChip) {
    interp = {
      ...interp,
      key_emotion: interp.key_emotion || vibeChip.key_emotion || '',
      feeling: [...interp.feeling, ...pickDescriptors(vibeChip.feeling, 2, rng)].slice(0, 4),
    };
  }

  if (productionChip) {
    interp = {
      ...interp,
      arrangement: [
        ...interp.arrangement,
        ...pickDescriptors(productionChip.arrangement, 2, rng),
      ].slice(0, 4),
      performance: [
        ...interp.performance,
        ...pickDescriptors(productionChip.performance ?? [], 1, rng),
      ].slice(0, 3),
      room: [...interp.room, ...pickDescriptors(productionChip.room ?? [], 1, rng)].slice(0, 3),
    };
  }

  // Fine-Tune Overrides always win.
  if (overrides.bpm != null && Number.isFinite(Number(overrides.bpm))) {
    interp.bpm = Math.round(Number(overrides.bpm));
  }
  if (overrides.key && overrides.key !== 'Auto') interp.key = overrides.key;
  interp.instrumental = overrides.instrumental !== false;
  if (overrides.vocalPocket && !interp.instrumental && !interp.vocal_direction) {
    interp.vocal_direction =
      'vocal sits tucked in the pocket, behind the beat, close-mic presence';
  }

  const { interpretation } = validateInterpretation(interp);
  return interpretation;
}
