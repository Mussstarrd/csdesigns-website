/**
 * Generates supabase/seed/001_seed_artist_dna.sql from src/data/seedArtists.js
 * so the bundled offline data and the server DB never drift apart.
 *
 *   npm run seed:sql
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_ARTISTS } from '../src/data/seedArtists.js';

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (a) => `ARRAY[${(a ?? []).map(q).join(', ')}]::TEXT[]`;
const num = (n) => (n == null ? 'NULL' : Number(n));

const rows = SEED_ARTISTS.map((e) =>
  `(${[
    q(e.artist_name),
    q(e.era_label),
    num(e.era_start),
    num(e.era_end),
    q(e.region),
    num(e.bpm_min),
    num(e.bpm_max),
    q(e.key_preference),
    q(e.feel),
    arr(e.percussion_dna),
    arr(e.low_end_dna),
    arr(e.lead_dna),
    arr(e.arrangement_dna),
    arr(e.energy_dna),
    arr(e.room_dna),
    arr(e.avoid_list),
    arr(e.anchor_tokens),
    num(e.display_order),
  ].join(',\n  ')})`
).join(',\n');

const sql = `-- GENERATED FILE — do not edit by hand. Run \`npm run seed:sql\`.
-- Seeds the 25 launch artist-era entries from src/data/seedArtists.js.

INSERT INTO artist_dna (
  artist_name, era_label, era_start, era_end, region,
  bpm_min, bpm_max, key_preference, feel,
  percussion_dna, low_end_dna, lead_dna, arrangement_dna,
  energy_dna, room_dna, avoid_list, anchor_tokens, display_order
) VALUES
${rows}
ON CONFLICT (artist_name, era_label) DO UPDATE SET
  era_start = EXCLUDED.era_start,
  era_end = EXCLUDED.era_end,
  region = EXCLUDED.region,
  bpm_min = EXCLUDED.bpm_min,
  bpm_max = EXCLUDED.bpm_max,
  key_preference = EXCLUDED.key_preference,
  feel = EXCLUDED.feel,
  percussion_dna = EXCLUDED.percussion_dna,
  low_end_dna = EXCLUDED.low_end_dna,
  lead_dna = EXCLUDED.lead_dna,
  arrangement_dna = EXCLUDED.arrangement_dna,
  energy_dna = EXCLUDED.energy_dna,
  room_dna = EXCLUDED.room_dna,
  avoid_list = EXCLUDED.avoid_list,
  anchor_tokens = EXCLUDED.anchor_tokens,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
`;

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'supabase', 'seed', '001_seed_artist_dna.sql');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`Wrote ${out} (${SEED_ARTISTS.length} entries)`);
