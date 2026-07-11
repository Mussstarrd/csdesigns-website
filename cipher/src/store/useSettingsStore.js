import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FRESHNESS_DEFAULT_WINDOW } from '../engine/freshness.js';

export const DAILY_FREE_LIMIT = 10;
const STYLE_PROFILE_MIN_PROMPTS = 10;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Median of a numeric array. */
function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

/** Most frequent value. */
function mode(values) {
  const counts = new Map();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = null;
  let bestCount = 0;
  for (const [v, c] of counts) if (c > bestCount) [best, bestCount] = [v, c];
  return best;
}

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Defaults
      defaultPlatform: 'both', // 'suno' | 'mureka' | 'both'
      freshnessWindow: FRESHNESS_DEFAULT_WINDOW,
      myTasteProtection: true, // default ON (Suno's My Taste learns permanently)

      // Free-tier client-side counter (server enforces authoritatively).
      usageDay: todayKey(),
      usageCount: 0,

      // Style Profile — auto-learned after 10 prompts.
      promptHistory: [], // [{bpm, key, region}] last 50

      setDefaultPlatform: (defaultPlatform) => set({ defaultPlatform }),
      setFreshnessWindow: (freshnessWindow) => set({ freshnessWindow }),
      setMyTasteProtection: (myTasteProtection) => set({ myTasteProtection }),

      /** Called after a successful Describe-It LLM generation. */
      recordAiUsage: (serverRemaining = null) => {
        const day = todayKey();
        const count =
          get().usageDay === day
            ? serverRemaining != null
              ? DAILY_FREE_LIMIT - serverRemaining
              : get().usageCount + 1
            : 1;
        set({ usageDay: day, usageCount: count });
      },

      aiRemaining: () => {
        const { usageDay, usageCount } = get();
        return usageDay === todayKey()
          ? Math.max(0, DAILY_FREE_LIMIT - usageCount)
          : DAILY_FREE_LIMIT;
      },

      /** Feed the style-profile learner (any successful build). */
      recordPrompt: ({ bpm, key, region }) => {
        const history = [...get().promptHistory, { bpm, key, region }].slice(-50);
        set({ promptHistory: history });
      },

      /**
       * Learned profile → Build It smart defaults.
       * null until the user has built 10 prompts.
       */
      styleProfile: () => {
        const history = get().promptHistory;
        if (history.length < STYLE_PROFILE_MIN_PROMPTS) return null;
        const bpms = history.map((h) => h.bpm).filter(Boolean);
        const homeBpm = median(bpms);
        return {
          bpmRange: homeBpm ? [Math.max(40, homeBpm - 8), Math.min(220, homeBpm + 8)] : null,
          preferredKey: mode(history.map((h) => h.key)),
          homeRegion: mode(history.map((h) => h.region)),
          promptCount: history.length,
        };
      },
    }),
    {
      name: 'cipher.settings.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
