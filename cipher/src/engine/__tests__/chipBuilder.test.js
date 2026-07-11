import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFromChips } from '../chipBuilder.js';
import { assembleSuno } from '../promptAssembler.js';
import { containsBannedWord } from '../bannedWords.js';
import { SEED_ARTISTS } from '../../data/seedArtists.js';
import {
  REGION_ERA_CHIPS,
  VIBE_CHIPS,
  PRODUCTION_STYLE_CHIPS,
} from '../../data/vibes.js';

test('chips-only build (no artist) produces a complete interpretation', () => {
  const interp = buildFromChips({
    regionChip: REGION_ERA_CHIPS[0], // NYC 90s
    vibeChip: VIBE_CHIPS[6], // Gritty
    productionChip: PRODUCTION_STYLE_CHIPS[1], // Sample-Driven
  });
  assert.equal(interp.genre_core, 'dusty 90s New York boom bap');
  assert.equal(interp.bpm, 91);
  assert.ok(interp.percussion_physical.length > 0);
  assert.ok(interp.feeling.length > 0);
  assert.ok(interp.arrangement.length > 0);
  const suno = assembleSuno(interp);
  assert.ok(suno.charCount > 0 && suno.charCount <= 990);
});

test('artist DNA base wins structural fields over region chip', () => {
  const future = SEED_ARTISTS.find((a) => a.era_label.includes('Dirty Sprite'));
  const interp = buildFromChips({
    artistDna: future,
    regionChip: REGION_ERA_CHIPS[0], // NYC 90s must NOT override
  });
  assert.equal(interp.bpm, 139); // Future's midpoint, not NYC's
  assert.ok(interp.percussion_physical[0].includes('hats stutter'));
});

test('fine-tune overrides win over everything', () => {
  const interp = buildFromChips(
    { regionChip: REGION_ERA_CHIPS[1] },
    { bpm: 150, key: 'B minor', instrumental: false, vocalPocket: true }
  );
  assert.equal(interp.bpm, 150);
  assert.equal(interp.key, 'B minor');
  assert.equal(interp.instrumental, false);
  assert.ok(interp.vocal_direction.includes('pocket'));
});

test('every region/vibe/production chip combination is banned-word clean', () => {
  for (const region of REGION_ERA_CHIPS) {
    for (const vibe of VIBE_CHIPS) {
      for (const prod of PRODUCTION_STYLE_CHIPS) {
        const interp = buildFromChips({ regionChip: region, vibeChip: vibe, productionChip: prod });
        const suno = assembleSuno(interp);
        assert.equal(
          containsBannedWord(suno.stylePrompt),
          false,
          `${region.id}+${vibe.id}+${prod.id}: ${suno.stylePrompt}`
        );
        assert.ok(suno.charCount <= 990);
      }
    }
  }
});
