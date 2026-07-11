import { create } from 'zustand';
import { loadArtistDna, groupByArtist } from '../services/artistDecoder.js';
import { seedArtistNames } from '../data/seedArtists.js';

/** Artist Decoder database — fetched on launch, cached 24h, offline-capable. */
export const useDecoderStore = create((set, get) => ({
  entries: [],
  grouped: [],
  source: null, // 'network' | 'cache' | 'bundled'
  loading: false,

  load: async ({ force = false } = {}) => {
    if (get().loading) return;
    set({ loading: true });
    const { entries, source } = await loadArtistDna({ force });
    set({ entries, grouped: groupByArtist(entries), source, loading: false });
  },

  /** All artist names — the assembler's name-scrub dictionary. */
  artistNames: () => {
    const fromDb = get().entries.map((e) => e.artist_name);
    return [...new Set([...fromDb, ...seedArtistNames()])];
  },
}));
