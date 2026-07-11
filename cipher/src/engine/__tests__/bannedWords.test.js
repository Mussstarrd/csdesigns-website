import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterBannedWords,
  scrubArtistNames,
  containsBannedWord,
} from '../bannedWords.js';

test('strips stock-sample summons', () => {
  const { text, hits } = filterBannedWords('heavy kick, cowbell accents, rim shot on the four');
  assert.ok(!/cowbell/i.test(text));
  assert.ok(!/rim/i.test(text));
  assert.ok(hits.length >= 2);
});

test('substitutes approved equivalents: 3/4, warm, half-time feel', () => {
  assert.equal(filterBannedWords('3/4').text, 'grouped in threes');
  assert.equal(filterBannedWords('warm').text, 'velvet on skin');
  assert.equal(filterBannedWords('half-time feel').text, 'halftime');
  assert.equal(filterBannedWords('half time feel').text, 'halftime');
});

test('never touches the approved word "halftime"', () => {
  const { text, hits } = filterBannedWords('140 BPM halftime feel, dark trap');
  assert.equal(text, '140 BPM halftime feel, dark trap');
  assert.equal(hits.length, 0);
});

test('"swung" survives while "swing" is substituted', () => {
  assert.equal(filterBannedWords('swung triplet cadence').text, 'swung triplet cadence');
  assert.ok(!/\bswing\b/i.test(filterBannedWords('light swing groove').text));
});

test('numbers in text do not corrupt the shield/restore cycle', () => {
  const input = '140 BPM halftime feel, 808 slides, 90s texture';
  const { text } = filterBannedWords(input);
  assert.ok(text.includes('140 BPM'));
  assert.ok(text.includes('808'));
  assert.ok(text.includes('halftime'));
});

test('jazz-gravity and pop trigger words are removed or substituted', () => {
  const dirty = 'warm soulful waltz, glossy radio-ready hooks, epic chiptune energy';
  const { text } = filterBannedWords(dirty);
  for (const banned of ['waltz', 'glossy', 'radio-ready', 'epic', 'chiptune', 'soulful']) {
    assert.ok(!text.toLowerCase().includes(banned), `should not contain ${banned}`);
  }
});

test('containsBannedWord final sweep detects leftovers', () => {
  assert.equal(containsBannedWord('gritty boom bap with cowbell'), true);
  assert.equal(containsBannedWord('gritty boom bap, halftime, swung hats'), false);
});

test('scrubArtistNames removes decoder names case-insensitively', () => {
  const { text, hits } = scrubArtistNames('sounds like Metro Boomin on a dark night', [
    'Metro Boomin',
    'Jadakiss',
  ]);
  assert.ok(!/metro boomin/i.test(text));
  assert.equal(hits.length, 1);
});
