/**
 * Blend Mode — Foundation + Texture constraint hierarchy.
 *
 * NOT a percentage slider over descriptor lists (that produces incoherent
 * soup — adversarial review). Instead:
 *
 *   FOUNDATION contributes: BPM, percussion DNA, low-end DNA, exclusions.
 *   TEXTURE contributes:    lead DNA, room DNA, energy/feeling DNA.
 *   Key: Foundation's key preference wins; Texture's key_emotion may color it.
 *   Avoid-lists: Foundation's avoid list wins outright — Texture descriptors
 *     that conflict with it are dropped.
 *   Flavor slider (60/40–90/10): controls how many Texture descriptors
 *     survive. It NEVER touches structural elements.
 */

import { emptyInterpretation, validateInterpretation } from './interpretationSchema.js';
import { pickDescriptors, resolveBpm } from './dna.js';

/** True if a descriptor collides with any avoid-list entry (word overlap). */
function conflictsWithAvoidList(descriptor, avoidList = []) {
  const words = String(descriptor).toLowerCase();
  return avoidList.some((avoid) => {
    const key = String(avoid).toLowerCase().replace(/^no\s+/, '').trim();
    return key.length > 2 && words.includes(key);
  });
}

/**
 * How many Texture descriptors survive per category for a given flavor.
 * flavor = Texture share, 0.10–0.40 (slider range 60/40 → 90/10).
 */
export function textureDescriptorCount(flavor) {
  const f = Math.max(0.1, Math.min(0.4, flavor ?? 0.3));
  if (f >= 0.35) return 3;
  if (f >= 0.2) return 2;
  return 1;
}

/**
 * Blend two artist_dna entries into one interpretation.
 *
 * @param foundation artist_dna row — drums + low end
 * @param texture    artist_dna row — melody + vibe
 * @param flavor     Texture share 0.10–0.40 (default 0.30 ≈ 70/30)
 * @param overrides  Fine-Tune overrides (bpm, key, energy, instrumental)
 * @param rng        optional rng for regenerate re-rolls
 */
export function blendDna(foundation, texture, flavor = 0.3, overrides = {}, rng = null) {
  const texCount = textureDescriptorCount(flavor);
  const energy = overrides.energy ?? 3;
  const density = energy >= 4 ? 3 : energy <= 2 ? 1 : 2;
  const avoid = foundation.avoid_list ?? [];

  // Texture picks are filtered against Foundation's avoid list FIRST —
  // Foundation wins outright, conflicting Texture descriptors are dropped.
  const textureSafe = (pool = []) => (pool ?? []).filter((d) => !conflictsWithAvoidList(d, avoid));

  const raw = {
    ...emptyInterpretation(),
    genre_core: [
      ...(foundation.anchor_tokens ?? []).slice(0, 2),
      ...(texture.anchor_tokens ?? []).slice(0, 1),
    ].join(' '),
    // Structural: all from Foundation. Flavor never touches these.
    bpm: resolveBpm(foundation, overrides.bpm),
    bpm_feel: (foundation.bpm_min ?? 0) >= 130 ? 'half-time feel' : '',
    key: overrides.key ?? foundation.key_preference ?? '',
    percussion_physical: pickDescriptors(foundation.percussion_dna, density, rng),
    low_end: pickDescriptors(foundation.low_end_dna, density, rng),
    exclusions: avoid.slice(0, 5),
    arrangement: pickDescriptors(foundation.arrangement_dna, Math.max(1, density - 1), rng),
    // Texture: lead, room, feeling — count scales with the flavor slider.
    lead: pickDescriptors(textureSafe(texture.lead_dna), texCount, rng),
    room: pickDescriptors(textureSafe(texture.room_dna), Math.max(1, texCount - 1), rng),
    feeling: pickDescriptors(textureSafe(texture.energy_dna), texCount, rng),
    // Strict modality dominance (Gemini review): key/BPM/exclusions are
    // Foundation-only; Texture contributes sonic descriptors exclusively,
    // so key_emotion stays empty rather than borrowing Texture language.
    key_emotion: '',
    instrumental: overrides.instrumental !== false,
    vocal_direction: null,
  };

  const { interpretation } = validateInterpretation(raw);
  return interpretation;
}
