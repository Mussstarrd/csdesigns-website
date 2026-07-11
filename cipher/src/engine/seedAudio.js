/**
 * Seed Audio Context — producers start with audio.
 *
 * Both Suno and Mureka accept uploaded audio as a generation seed. If the
 * user's audio already contains drums, CIPHER must NOT describe drums — the
 * AI would double-stack. Instead the corresponding DNA categories are omitted
 * and complement language is added so the generation defers to the upload.
 */

export const SEED_AUDIO_CATEGORIES = ['drums', 'bass', 'melody', 'vocals'];

export const SEED_AUDIO_LABELS = {
  drums: 'Drums',
  bass: 'Bass',
  melody: 'Melody/Chords',
  vocals: 'Vocals',
};

// Which interpretation fields each audio category displaces, and what
// complement language replaces them.
const CATEGORY_RULES = {
  drums: {
    omitFields: ['percussion_physical'],
    complement: 'percussion follows the uploaded rhythm unchanged, no added drums',
  },
  bass: {
    omitFields: ['low_end'],
    complement: 'low end defers to the uploaded bass, nothing added beneath it',
  },
  melody: {
    omitFields: ['lead'],
    complement: 'melodic content follows the uploaded melody, no competing lead',
  },
  vocals: {
    omitFields: [],
    complement: 'vocal space reserved for the uploaded vocal, nothing layered over it',
    forceInstrumentalHandling: true,
  },
};

/**
 * Apply seed-audio context to an interpretation. Pure — returns a new object.
 * `contains` is an array of category keys from SEED_AUDIO_CATEGORIES.
 */
export function applySeedAudioContext(interpretation, contains = []) {
  const active = (contains || []).filter((c) => CATEGORY_RULES[c]);
  if (!active.length) return { interpretation, complements: [] };

  const out = { ...interpretation };
  const complements = [];
  for (const key of active) {
    const rule = CATEGORY_RULES[key];
    for (const field of rule.omitFields) out[field] = [];
    complements.push(rule.complement);
    if (rule.forceInstrumentalHandling) {
      // The upload provides the vocal; the prompt must not direct a new one.
      out.vocal_direction = null;
    }
  }
  // Complement language rides in the arrangement section — structural truth
  // about how the generation must relate to the upload.
  out.arrangement = [...(out.arrangement || []), ...complements];
  return { interpretation: out, complements };
}
