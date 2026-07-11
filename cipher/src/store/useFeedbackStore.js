import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { suspectReport } from '../engine/feedbackAttribution.js';
import { buildFeedbackEvent, submitFeedback } from '../services/feedbackService.js';

/**
 * Learning System store — every rated generation is kept locally (for the
 * on-device Trigger Lab) and synced to Supabase (for cross-user evidence).
 * Failed submissions queue and retry on next launch.
 */
export const useFeedbackStore = create(
  persist(
    (set, get) => ({
      events: [], // all local feedback, newest first (capped at 200)
      pending: [], // events not yet accepted by the server

      record: async ({ platform, rating, issues, unwantedText, promptText }) => {
        const event = buildFeedbackEvent({
          platform,
          rating,
          issues,
          unwantedText,
          promptText,
        });
        set({ events: [event, ...get().events].slice(0, 200) });
        const ok = await submitFeedback(event);
        if (!ok) set({ pending: [...get().pending, event].slice(-50) });
        return event;
      },

      /** Retry queued submissions (called on app launch). */
      flush: async () => {
        const still = [];
        for (const event of get().pending) {
          const ok = await submitFeedback(event);
          if (!ok) still.push(event);
        }
        set({ pending: still });
      },

      /** Local suspect terms for the Trigger Lab (Settings). */
      suspects: () => suspectReport(get().events, { minOccurrences: 3 }),

      ratedCount: () => get().events.length,
    }),
    {
      name: 'cipher.feedback.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ events: state.events, pending: state.pending }),
    }
  )
);
