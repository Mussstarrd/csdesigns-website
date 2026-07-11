import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleInterpretation } from '../dna.js';

const pooled = {
  genre_core: 'dark trap',
  bpm: 140,
  bpm_feel: 'halftime feel',
  key: 'A minor',
  key_emotion: 'sinister',
  arrangement: ['a1', 'a2', 'a3', 'a4', 'a5'],
  performance: ['p1', 'p2', 'p3', 'p4'],
  percussion_physical: ['d1', 'd2', 'd3', 'd4', 'd5'],
  low_end: ['l1', 'l2', 'l3', 'l4'],
  lead: ['m1', 'm2', 'm3', 'm4', 'm5'],
  room: ['r1', 'r2', 'r3'],
  feeling: ['f1', 'f2', 'f3', 'f4'],
  exclusions: ['x1', 'x2'],
  instrumental: true,
  vocal_direction: null,
};

test('samples a subset per category; structural fields pass through', () => {
  const sampled = sampleInterpretation(pooled);
  assert.equal(sampled.lead.length, 2);
  assert.equal(sampled.percussion_physical.length, 2);
  assert.equal(sampled.bpm, 140);
  assert.equal(sampled.key, 'A minor');
  assert.deepEqual(sampled.exclusions, ['x1', 'x2']);
  assert.equal(sampled.instrumental, true);
});

test('without rng the sample is stable (first build is deterministic)', () => {
  assert.deepEqual(sampleInterpretation(pooled), sampleInterpretation(pooled));
});

test('with rng, regenerate draws different descriptors from the pool', () => {
  // A seeded pseudo-rng that walks the pool differently than first-N.
  let n = 0;
  const rng = () => ((n += 7) % 10) / 10;
  const rolled = sampleInterpretation(pooled, {}, rng);
  const stable = sampleInterpretation(pooled);
  assert.notDeepEqual(rolled.lead, stable.lead);
  // Every pick still comes from the pool.
  for (const item of rolled.lead) assert.ok(pooled.lead.includes(item));
  // Structure untouched by the roll.
  assert.equal(rolled.bpm, 140);
});
