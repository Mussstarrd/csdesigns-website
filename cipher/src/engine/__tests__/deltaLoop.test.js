import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDelta } from '../deltaLoop.js';
import { invertExclusions } from '../exclusions.js';

const base = () => ({
  genre_core: 'gritty boom bap',
  bpm: 92,
  bpm_feel: '',
  key: 'C minor',
  key_emotion: '',
  arrangement: ['loop-driven'],
  performance: [],
  percussion_physical: ['cracked snare on the two and four'],
  low_end: ['dry walking bassline'],
  lead: ['dusty piano loop'],
  room: [],
  feeling: ['cold tension', 'street documentary feel'],
  exclusions: [],
  instrumental: true,
  vocal_direction: null,
});

test('unwanted_element: excludes it AND injects a competing element', () => {
  const { interpretation, notes } = applyDelta(base(), {
    rating: 'trash',
    issues: ['unwanted_element'],
    unwantedText: 'saxophone',
  });
  assert.ok(interpretation.exclusions.includes('saxophone'));
  assert.ok(interpretation.lead.some((d) => d.includes('synth lead')));
  assert.ok(notes.length > 0);
});

test('suspect terms drop descriptors — but never empty a section', () => {
  const { interpretation } = applyDelta(
    base(),
    { rating: 'trash', issues: ['unwanted_element'], unwantedText: 'sax' },
    { suspectTerms: ['dusty'] }
  );
  // 'dusty piano loop' would be dropped, but it's the only lead descriptor
  // besides the injection — the injection keeps the section non-empty.
  assert.ok(interpretation.lead.length > 0);
});

test('unwanted_fills switches policy to displaced groove', () => {
  const { policy, notes } = applyDelta(base(), { rating: 'ok', issues: ['unwanted_fills'] });
  assert.equal(policy.grooveStyle, 'displaced');
  assert.ok(notes.some((n) => n.includes('space')));
});

test('muddy_mix injects anti-mud language', () => {
  const { interpretation } = applyDelta(base(), { rating: 'ok', issues: ['muddy_mix'] });
  assert.ok(interpretation.room.includes('tight low-end'));
});

test('vocal_leak forces instrumental handling', () => {
  const start = { ...base(), instrumental: false, vocal_direction: 'raspy' };
  const { interpretation } = applyDelta(start, { rating: 'trash', issues: ['vocal_leak'] });
  assert.equal(interpretation.instrumental, true);
  assert.equal(interpretation.vocal_direction, null);
  assert.ok(interpretation.exclusions.includes('vocals'));
});

test('stock_kit swaps kit nouns for physical event descriptors', () => {
  const { interpretation } = applyDelta(base(), { rating: 'ok', issues: ['stock_kit'] });
  assert.ok(!interpretation.percussion_physical.some((d) => /\bsnare\b/i.test(d)));
  assert.ok(interpretation.percussion_physical.some((d) => d.includes('cracked hit')));
});

test('too_generic trims broad adjectives and raises density', () => {
  const { interpretation, policy } = applyDelta(base(), { rating: 'ok', issues: ['too_generic'] });
  assert.equal(interpretation.feeling.length, 1);
  assert.equal(policy.density, 3);
});

test('structure_ignored sets the simplify policy', () => {
  const { policy } = applyDelta(base(), { rating: 'ok', issues: ['structure_ignored'] });
  assert.equal(policy.simplifyStructure, true);
});

test('inversion table covers common exclusions and caps output', () => {
  assert.ok(invertExclusions(['saxophone'])[0].includes('synth lead'));
  assert.ok(invertExclusions(['acoustic guitar'])[0].includes('piano-led'));
  assert.equal(invertExclusions(['sax', 'guitar', 'strings'], 2).length, 2);
  assert.equal(invertExclusions(['nonexistent-thing']).length, 0);
});

test('delta is pure — the input interpretation is not mutated', () => {
  const input = base();
  const snapshot = JSON.stringify(input);
  applyDelta(input, { rating: 'trash', issues: ['muddy_mix', 'vocal_leak'] });
  assert.equal(JSON.stringify(input), snapshot);
});
