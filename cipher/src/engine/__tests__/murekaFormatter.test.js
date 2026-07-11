import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleMureka, bpmToFeel } from '../murekaFormatter.js';
import { buildStructureBlock } from '../structureTemplates.js';
import { validateMureka } from '../validator.js';

const interp = {
  genre_core: 'Atlanta crunk-trap',
  bpm: 140,
  bpm_feel: 'halftime feel',
  key: 'A minor',
  key_emotion: 'sinister aggressive',
  arrangement: ['stripped to lead + sub + kick'],
  performance: [],
  percussion_physical: ['low firm drum thump deep tucked'],
  low_end: ['sub-bass deep fat clean short thumps'],
  lead: ['single dark synth lead stabs'],
  room: ['vast minimalist'],
  feeling: ['loud confrontational swagger'],
  exclusions: [],
  instrumental: true,
  vocal_direction: null,
};

test('BPM converts to feel descriptor only — no raw numbers in Mureka style', () => {
  assert.equal(bpmToFeel(140, 'halftime feel'), 'sluggish halftime pace');
  const result = assembleMureka(interp);
  assert.ok(!/\b140\b/.test(result.musicStyle), 'raw BPM leaked');
  assert.ok(result.musicStyle.includes('sluggish halftime pace'));
  assert.equal(validateMureka(result).ok, true);
});

test('vocal direction is null for instrumentals, present otherwise', () => {
  assert.equal(assembleMureka(interp).vocalDirection, null);
  const vocal = {
    ...interp,
    instrumental: false,
    vocal_direction: 'gritty close-mic delivery, tucked behind the beat',
  };
  assert.ok(assembleMureka(vocal).vocalDirection.includes('close-mic'));
});

test('structure block is always output, even for instrumentals', () => {
  const result = assembleMureka(interp);
  assert.ok(result.structureBlock.includes('[Intro'));
  assert.ok(result.structureBlock.includes('[Outro'));
  // Element names injected from the interpretation, not left as placeholders.
  assert.ok(!result.structureBlock.includes('{'));
  assert.ok(result.structureBlock.toLowerCase().includes('sub-bass deep fat'));
});

test('structure template picked by genre + energy', () => {
  const high = buildStructureBlock(interp, 5);
  assert.equal(high.templateId, 'trap-high');
  const low = buildStructureBlock(interp, 1);
  assert.equal(low.templateId, 'trap-low');
  const boomBap = buildStructureBlock({ ...interp, genre_core: 'gritty boom bap' }, 2);
  assert.equal(boomBap.templateId, 'boombap-low');
  const unknown = buildStructureBlock({ ...interp, genre_core: 'polka fusion' }, 3);
  assert.equal(unknown.templateId, 'default');
});

test('validateMureka flags raw BPM numbers', () => {
  assert.equal(validateMureka({ musicStyle: 'dark trap at 140 BPM' }).ok, false);
});
