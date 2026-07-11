import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatExclusions,
  detectExclusionConflicts,
  MAX_EXCLUSIONS,
} from '../exclusions.js';

test('formats as "no [element]" comma-separated', () => {
  const { text } = formatExclusions(['snare slap', 'no hats', 'FILLER']);
  assert.equal(text, 'no snare slap, no hats, no filler');
});

test('hard cap at 5 items, extras reported as dropped', () => {
  const { items, dropped, text } = formatExclusions([
    'a', 'b', 'c', 'd', 'e', 'f', 'g',
  ]);
  assert.equal(items.length, MAX_EXCLUSIONS);
  assert.deepEqual(dropped, ['f', 'g']);
  assert.equal(text.split(',').length, 5);
});

test('dedupes and drops empties', () => {
  const { items } = formatExclusions(['hats', 'no hats', '', '  ', 'HATS']);
  assert.deepEqual(items, ['hats']);
});

test('conflict map: boom bap positive + sampled drums exclusion warns', () => {
  const warnings = detectExclusionConflicts(
    '92 BPM, C minor, gritty boom bap, dusty loop',
    ['sampled drums']
  );
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].positive, 'boom bap');
});

test('conflict map: trap positive + 808 exclusion warns', () => {
  const warnings = detectExclusionConflicts('dark Atlanta trap', ['808']);
  assert.ok(warnings.some((w) => w.positive === 'trap'));
});

test('no false conflict when styles are unrelated', () => {
  const warnings = detectExclusionConflicts('west coast g-funk glide', ['sampled drums']);
  assert.equal(warnings.length, 0);
});
