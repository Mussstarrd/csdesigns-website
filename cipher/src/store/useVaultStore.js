import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The Vault — saved prompts with session grouping (versioning).
 * Regenerations from the same input share a sessionKey and stack as versions
 * on one session card; the user can star the winning version.
 *
 * Version shape: {
 *   id, createdAt, platform ('suno'|'mureka'|'both'),
 *   suno: {stylePrompt, excludeField} | null,
 *   mureka: {musicStyle, vocalDirection, structureBlock, tempoFeel} | null,
 *   freshness: {score, band, approximate},
 *   vector: number[] | null,   // cached embedding for future freshness math
 *   starred: boolean,
 * }
 */
// Freshness only ever compares against the most recent entries, but the
// whole Vault persists as ONE AsyncStorage row (Android caps a row around
// 2MB) — so embedding vectors are kept only on the newest N versions and
// stripped from everything older.
const VECTOR_KEEP = 20;

function pruneVectors(sessions) {
  const all = [];
  for (const s of sessions) for (const v of s.versions) all.push(v);
  all.sort((a, b) => b.createdAt - a.createdAt);
  const keep = new Set(all.slice(0, VECTOR_KEEP).map((v) => v.id));
  return sessions.map((s) => ({
    ...s,
    versions: s.versions.map((v) =>
      v.vector && !keep.has(v.id) ? { ...v, vector: null } : v
    ),
  }));
}

export const useVaultStore = create(
  persist(
    (set, get) => ({
      sessions: [], // [{sessionKey, label, createdAt, versions: [version]}] newest first

      saveVersion: ({ sessionKey, label, version }) => {
        const sessions = [...get().sessions];
        const idx = sessions.findIndex((s) => s.sessionKey === sessionKey);
        const entry = {
          ...version,
          id: `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          starred: false,
        };
        if (idx >= 0) {
          const session = {
            ...sessions[idx],
            versions: [entry, ...sessions[idx].versions],
          };
          sessions.splice(idx, 1);
          sessions.unshift(session); // bump to top
        } else {
          sessions.unshift({
            sessionKey,
            label,
            createdAt: Date.now(),
            versions: [entry],
          });
        }
        set({ sessions: pruneVectors(sessions) });
        return entry.id;
      },

      starVersion: (sessionKey, versionId) => {
        set({
          sessions: get().sessions.map((s) =>
            s.sessionKey !== sessionKey
              ? s
              : {
                  ...s,
                  versions: s.versions.map((v) => ({
                    ...v,
                    starred: v.id === versionId ? !v.starred : false,
                  })),
                }
          ),
        });
      },

      deleteVersion: (sessionKey, versionId) => {
        set({
          sessions: get()
            .sessions.map((s) =>
              s.sessionKey !== sessionKey
                ? s
                : { ...s, versions: s.versions.filter((v) => v.id !== versionId) }
            )
            .filter((s) => s.versions.length > 0),
        });
      },

      deleteSession: (sessionKey) => {
        set({ sessions: get().sessions.filter((s) => s.sessionKey !== sessionKey) });
      },

      /**
       * The last N saved prompt texts+vectors, newest first — the freshness
       * comparison window.
       */
      recentEntries: (n = 10) => {
        const out = [];
        for (const session of get().sessions) {
          for (const v of session.versions) {
            out.push({
              text: v.suno?.stylePrompt ?? v.mureka?.musicStyle ?? '',
              vector: v.vector ?? null,
              createdAt: v.createdAt,
            });
          }
        }
        return out.sort((a, b) => b.createdAt - a.createdAt).slice(0, n);
      },

      /** Last 3 individual versions for the Home screen strip. */
      recentVersions: (n = 3) => {
        const out = [];
        for (const session of get().sessions) {
          for (const v of session.versions) out.push({ session, version: v });
        }
        return out.sort((a, b) => b.version.createdAt - a.version.createdAt).slice(0, n);
      },
    }),
    {
      name: 'cipher.vault.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
