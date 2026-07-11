import { create } from 'zustand';
import { buildPrompt } from '../engine/buildPrompt.js';
import { buildFromChips } from '../engine/chipBuilder.js';
import { blendDna } from '../engine/blend.js';
import { surpriseMe } from '../engine/surpriseMe.js';
import { validateInterpretation } from '../engine/interpretationSchema.js';
import { validateSuno, validateMureka } from '../engine/validator.js';
import { useDecoderStore } from './useDecoderStore.js';

/**
 * The current build — source spec, interpretation, assembled output.
 * `source` records HOW the interpretation was produced so [REGENERATE] knows
 * whether to re-roll locally (build/blend/surprise) or whether the input was
 * a Describe It (already-interpreted JSON gets re-rolled locally too; only a
 * brand-new description needs Claude again).
 */
export const usePromptStore = create((set, get) => ({
  source: null, // {type: 'describe'|'build'|'blend'|'surprise', ...payload}
  platform: 'both',
  energy: 3,
  seedAudio: { enabled: false, contains: [] },
  interpretation: null,
  result: null, // buildPrompt() output
  regenCount: 0,

  setPlatform: (platform) => set({ platform }),

  /** Assemble (or re-assemble) from an interpretation. */
  runBuild: ({ source, interpretation, energy = 3, seedAudio, platform }) => {
    const artistNames = useDecoderStore.getState().artistNames();
    const { interpretation: clean } = validateInterpretation(interpretation);
    const result = buildPrompt(clean, {
      artistNames,
      energy,
      seedAudio: seedAudio ?? get().seedAudio,
    });
    set({
      source,
      interpretation: clean,
      result,
      energy,
      seedAudio: seedAudio ?? get().seedAudio,
      platform: platform ?? get().platform,
      regenCount: 0,
    });
    return result;
  },

  /**
   * [REGENERATE] — same input, assembler re-rolls descriptor picks.
   * Deterministic paths never touch the network. Describe It inputs re-roll
   * from their existing interpretation (a fresh LLM call is only made when
   * the user edits the description and rebuilds).
   */
  regenerate: () => {
    const { source, energy, seedAudio, interpretation } = get();
    if (!source || (source.type === 'saved' && !interpretation)) return null;
    const rng = Math.random;
    let interp = interpretation;
    if (source.type === 'build') {
      interp = buildFromChips(source.chips, source.overrides, rng);
    } else if (source.type === 'blend') {
      interp = blendDna(source.foundation, source.texture, source.flavor, source.overrides, rng);
    } else if (source.type === 'surprise') {
      interp = surpriseMe(rng);
    }
    // describe: keep the interpretation, re-assembly still re-runs filters.
    const artistNames = useDecoderStore.getState().artistNames();
    const result = buildPrompt(interp, { artistNames, energy, seedAudio });
    set({ interpretation: interp, result, regenCount: get().regenCount + 1 });
    return result;
  },

  /** Reopen a saved Vault version on the Output screen (EDIT action). */
  loadSaved: (version) => {
    const suno = version.suno
      ? {
          stylePrompt: version.suno.stylePrompt,
          excludeField: version.suno.excludeField ?? '',
          charCount: version.suno.stylePrompt.length,
          conflicts: [],
          warnings: [],
          truncated: [],
          instrumental: /\binstrumental$/.test(version.suno.stylePrompt.trim()),
        }
      : null;
    const mureka = version.mureka
      ? { ...version.mureka, charCount: version.mureka.musicStyle?.length ?? 0, warnings: [] }
      : null;
    set({
      source: { type: 'saved', versionId: version.id },
      interpretation: null,
      platform: version.platform ?? 'both',
      result: {
        suno,
        mureka,
        sunoValidation: suno
          ? validateSuno({
              stylePrompt: suno.stylePrompt,
              excludeField: suno.excludeField,
              instrumental: suno.instrumental,
            })
          : null,
        murekaValidation: mureka ? validateMureka(mureka) : null,
      },
      regenCount: 0,
    });
  },

  /** Live re-validation as the user edits prompt text on the Output screen. */
  applyEdit: (platformKey, field, text) => {
    const { result } = get();
    if (!result) return;
    const next = { ...result, [platformKey]: { ...result[platformKey], [field]: text } };
    // Recompute validation for the edited platform.
    if (platformKey === 'suno') {
      next.sunoValidation = validateSuno({
        stylePrompt: next.suno.stylePrompt,
        excludeField: next.suno.excludeField,
        instrumental: next.suno.instrumental,
      });
      next.suno = { ...next.suno, charCount: next.suno.stylePrompt.length };
    } else {
      next.murekaValidation = validateMureka(next.mureka);
      next.mureka = { ...next.mureka, charCount: next.mureka.musicStyle.length };
    }
    set({ result: next });
  },

  /** Stable key for Vault session grouping — same input → same session. */
  sessionKey: () => {
    const { source } = get();
    if (!source) return `s_${Date.now()}`;
    if (source.type === 'describe') return `describe:${source.normalized}`;
    if (source.type === 'build') {
      const c = source.chips ?? {};
      return `build:${c.artistDna?.id ?? c.artistDna?.era_label ?? ''}:${c.regionChip?.id ?? ''}:${
        c.vibeChip?.id ?? ''
      }:${c.productionChip?.id ?? ''}`;
    }
    if (source.type === 'blend') {
      return `blend:${source.foundation?.era_label}:${source.texture?.era_label}`;
    }
    return `surprise:${source.comboRegion ?? 'any'}`;
  },
}));
