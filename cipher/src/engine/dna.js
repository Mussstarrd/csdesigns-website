/**
 * DNA → interpretation mapping — the fully deterministic Build It path.
 * Chip selections resolve to artist_dna rows (or vibe/region partials); this
 * module converts them into a Stage 1 interpretation object with NO LLM call.
 */

import { emptyInterpretation, validateInterpretation } from './interpretationSchema.js';

/** Pick up to n items from a pool, deterministically unless rng provided. */
export function pickDescriptors(pool = [], n = 2, rng = null) {
  const items = (pool ?? []).filter(Boolean);
  if (!rng) return items.slice(0, n);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/** Midpoint BPM of a DNA range, honoring an override. */
export function resolveBpm(dna, override) {
  if (override != null && Number.isFinite(Number(override))) return Math.round(Number(override));
  if (dna?.bpm_min && dna?.bpm_max) return Math.round((dna.bpm_min + dna.bpm_max) / 2);
  return dna?.bpm_min ?? dna?.bpm_max ?? null;
}

/**
 * Build an interpretation from a single artist_dna entry plus Fine-Tune
 * overrides { bpm, key, energy (1–5), instrumental, vocalPocket }.
 * `rng` (optional) enables regenerate re-rolls; omitted = stable first roll.
 */
export function dnaToInterpretation(dna, overrides = {}, rng = null) {
  const energy = overrides.energy ?? 3;
  // Higher energy pulls more descriptors into the prompt.
  const density = energy >= 4 ? 3 : energy <= 2 ? 1 : 2;

  const raw = {
    ...emptyInterpretation(),
    genre_core: dna.feel ? `${dna.region ?? ''} ${dna.feel}`.trim() : dna.region ?? '',
    bpm: resolveBpm(dna, overrides.bpm),
    bpm_feel: (dna.bpm_min ?? 0) >= 130 ? 'halftime feel' : '',
    key: overrides.key ?? dna.key_preference ?? '',
    key_emotion: '',
    arrangement: pickDescriptors(dna.arrangement_dna, density, rng),
    performance: [],
    percussion_physical: pickDescriptors(dna.percussion_dna, density, rng),
    low_end: pickDescriptors(dna.low_end_dna, density, rng),
    lead: pickDescriptors(dna.lead_dna, density, rng),
    room: pickDescriptors(dna.room_dna, Math.max(1, density - 1), rng),
    feeling: pickDescriptors(dna.energy_dna, density, rng),
    exclusions: (dna.avoid_list ?? []).slice(0, 5),
    instrumental: overrides.instrumental !== false,
    vocal_direction: null,
  };

  // Anchor tokens are heavily weighted — they lead the genre_core so they
  // land in the front-loaded segment of the Prompt Stack.
  if (Array.isArray(dna.anchor_tokens) && dna.anchor_tokens.length) {
    raw.genre_core = dna.anchor_tokens.slice(0, 3).join(' ');
  }

  if (overrides.vocalPocket && !raw.instrumental) {
    raw.vocal_direction = 'vocal sits tucked in the pocket, behind the beat, close-mic presence';
  }

  const { interpretation } = validateInterpretation(raw);
  return interpretation;
}
