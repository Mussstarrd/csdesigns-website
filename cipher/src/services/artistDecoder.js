/**
 * Artist Decoder fetch + cache layer.
 *
 * - Fetches the artist_dna table from Supabase on launch.
 * - Caches to AsyncStorage; refreshes when the cache is older than 24h.
 * - Works fully offline: cache first, bundled seed data as the floor.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient.js';
import { SEED_ARTISTS } from '../data/seedArtists.js';

const CACHE_KEY = 'cipher.artistDna.v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Load the decoder database. Returns { entries, source } where source is
 * 'network' | 'cache' | 'bundled'. Never throws — worst case is seed data.
 */
export async function loadArtistDna({ force = false } = {}) {
  let cached = null;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch {
    cached = null;
  }

  const fresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;
  if (cached && fresh && !force) {
    return { entries: cached.entries, source: 'cache' };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('artist_dna')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ entries: data, fetchedAt: Date.now() })
        );
        return { entries: data, source: 'network' };
      }
    } catch {
      // fall through to cache/bundled
    }
  }

  if (cached?.entries?.length) return { entries: cached.entries, source: 'cache' };
  return { entries: SEED_ARTISTS, source: 'bundled' };
}

/** Group flat rows into { artist_name, eras: [rows sorted by era_start] }. */
export function groupByArtist(entries) {
  const map = new Map();
  for (const row of entries) {
    if (!map.has(row.artist_name)) map.set(row.artist_name, []);
    map.get(row.artist_name).push(row);
  }
  return [...map.entries()]
    .map(([artist_name, eras]) => ({
      artist_name,
      eras: eras.sort((a, b) => (a.era_start ?? 0) - (b.era_start ?? 0)),
      multiEra: eras.length > 1,
    }))
    .sort(
      (a, b) => (a.eras[0].display_order ?? 999) - (b.eras[0].display_order ?? 999)
    );
}

/** Case-insensitive artist-name detection for short-input interception. */
export function findArtistInText(text, entries) {
  const lower = String(text ?? '').toLowerCase();
  for (const row of entries) {
    const name = row.artist_name.toLowerCase();
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) return row;
  }
  return null;
}

/** Unified search over artist-eras for the Blend slots + browse UI. */
export function searchDecoder(query, entries) {
  const q = String(query ?? '').toLowerCase().trim();
  if (!q) return entries;
  return entries.filter((row) =>
    [row.artist_name, row.era_label, row.region, row.feel, ...(row.anchor_tokens ?? [])]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q))
  );
}

/** Human-readable DNA summary used for confirmation cards + LLM context. */
export function describeDna(row) {
  return [
    row.anchor_tokens?.[0] ?? row.feel,
    row.bpm_min && row.bpm_max ? `${row.bpm_min}-${row.bpm_max} BPM` : null,
    row.key_preference,
    row.percussion_dna?.[0],
    row.low_end_dna?.[0],
    row.lead_dna?.[0],
  ]
    .filter(Boolean)
    .join(', ');
}

/** Submit a "Suggest an artist" form entry. */
export async function suggestArtist({ artistName, eraHint, note }) {
  if (!supabase) throw new Error('offline');
  const { error } = await supabase
    .from('artist_suggestions')
    .insert({ artist_name: artistName, era_hint: eraHint ?? null, note: note ?? null });
  if (error) throw error;
}
