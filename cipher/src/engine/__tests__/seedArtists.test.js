import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_ARTISTS, seedArtistNames } from '../../data/seedArtists.js';
import { containsBannedWord, filterBannedWords } from '../bannedWords.js';
import { dnaToInterpretation } from '../dna.js';
import { assembleSuno, SUNO_HARD_CEILING } from '../promptAssembler.js';
import { assembleMureka } from '../murekaFormatter.js';
import { validateMureka } from '../validator.js';
import { MAX_EXCLUSIONS } from '../exclusions.js';

const DNA_TEXT_FIELDS = [
  'feel',
  'percussion_dna',
  'low_end_dna',
  'lead_dna',
  'arrangement_dna',
  'energy_dna',
  'room_dna',
  'anchor_tokens',
];

test('exactly 25 seed entries, unique (artist, era) pairs', () => {
  assert.equal(SEED_ARTISTS.length, 25);
  const keys = new Set(SEED_ARTISTS.map((a) => `${a.artist_name}::${a.era_label}`));
  assert.equal(keys.size, 25);
});

test('every seed entry has complete DNA and valid ranges', () => {
  for (const entry of SEED_ARTISTS) {
    assert.ok(entry.artist_name && entry.era_label && entry.region, entry.artist_name);
    assert.ok(entry.bpm_min >= 40 && entry.bpm_max <= 220 && entry.bpm_min <= entry.bpm_max);
    assert.ok(entry.key_preference);
    assert.ok(entry.percussion_dna.length >= 2, `${entry.artist_name} percussion`);
    assert.ok(entry.low_end_dna.length >= 2, `${entry.artist_name} low end`);
    assert.ok(entry.lead_dna.length >= 2, `${entry.artist_name} lead`);
    assert.ok(entry.arrangement_dna.length >= 1);
    assert.ok(entry.energy_dna.length >= 1);
    assert.ok(entry.room_dna.length >= 1);
    assert.ok(entry.anchor_tokens.length >= 1);
    assert.ok(entry.avoid_list.length >= 1 && entry.avoid_list.length <= MAX_EXCLUSIONS);
  }
});

test('no banned trigger words anywhere in seed DNA text', () => {
  for (const entry of SEED_ARTISTS) {
    for (const field of DNA_TEXT_FIELDS) {
      const items = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
      for (const text of items) {
        assert.equal(
          containsBannedWord(text),
          false,
          `${entry.artist_name} / ${entry.era_label} / ${field}: "${text}" hits ${JSON.stringify(
            filterBannedWords(text).hits
          )}`
        );
      }
    }
  }
});

test('entries are genuinely distinct — no descriptor reused across artists', () => {
  const seen = new Map();
  for (const entry of SEED_ARTISTS) {
    for (const field of ['percussion_dna', 'low_end_dna', 'lead_dna']) {
      for (const text of entry[field]) {
        const key = text.toLowerCase();
        assert.ok(
          !seen.has(key),
          `"${text}" appears in both ${seen.get(key)} and ${entry.artist_name}`
        );
        seen.set(key, entry.artist_name);
      }
    }
  }
});

test('every seed entry assembles clean Suno + Mureka output', () => {
  const names = seedArtistNames();
  for (const entry of SEED_ARTISTS) {
    const interp = dnaToInterpretation(entry, { energy: 4 });
    const suno = assembleSuno(interp, { artistNames: names });
    assert.ok(suno.charCount > 0 && suno.charCount <= SUNO_HARD_CEILING, entry.era_label);
    assert.equal(containsBannedWord(suno.stylePrompt), false, entry.era_label);
    assert.ok(suno.stylePrompt.endsWith('instrumental'), entry.era_label);
    // Artist names must never leak into the prompt.
    for (const name of names) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.ok(
        !new RegExp(`\\b${escaped}\\b`, 'i').test(suno.stylePrompt),
        `${name} leaked into ${entry.era_label}`
      );
    }
    const mureka = assembleMureka(interp, { artistNames: names, energy: 4 });
    assert.equal(validateMureka(mureka).ok, true, entry.era_label);
    assert.ok(mureka.structureBlock.includes('[Intro'));
  }
});
