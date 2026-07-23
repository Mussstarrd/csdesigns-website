import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterBannedWords,
  scrubArtistNames,
  containsBannedWord,
  analyzeWatchWords,
  detectAttractors,
  setDynamicRules,
} from '../bannedWords.js';

test('v2: groove vocabulary is NEVER stripped — swing, shuffle, half-time', () => {
  const input = '140 BPM, half-time feel, laid-back swing rhythm, ghost-note shuffle feel';
  const { text, hits } = filterBannedWords(input);
  assert.equal(text, input);
  assert.equal(hits.length, 0);
  assert.equal(containsBannedWord(input), false);
});

test('v2: former kill-list folklore is not stripped either', () => {
  const input = 'warm soulful keys, cowbell accent, epic strings';
  const { text } = filterBannedWords(input);
  assert.equal(text, input); // untouched — hard tier is dynamic-rules only
});

test('watch tier warns without touching text', () => {
  const warnings = analyzeWatchWords('warm soulful pad with a cowbell accent');
  const labels = warnings.map((w) => w.label);
  assert.ok(labels.includes('warm'));
  assert.ok(labels.includes('soulful'));
  assert.ok(labels.includes('cowbell'));
  assert.ok(warnings.every((w) => w.tier === 'watch'));
});

test('"!" exemption suppresses watch warnings', () => {
  assert.equal(analyzeWatchWords('!warm keys').length, 0);
  assert.ok(analyzeWatchWords('warm keys').length > 0);
});

test('attractors warn contextually on genre core', () => {
  // Violin in a trap build → orchestral pull warning.
  const inTrap = detectAttractors('dark trap with violin line', 'dark Atlanta trap');
  assert.ok(inTrap.some((w) => w.label.includes('violin')));
  // Strings in a chipmunk-soul build → at home, no warning.
  const atHome = detectAttractors('string section swells', 'chipmunk soul east coast');
  assert.equal(atHome.filter((w) => w.label.includes('violin')).length, 0);
});

test('bare "epic" warns outside cinematic builds', () => {
  const warnings = detectAttractors('epic bells', 'gritty boom bap');
  assert.ok(warnings.some((w) => w.attracts.includes('trailer')));
  const cinematic = detectAttractors('epic bells', 'cinematic dark trap');
  assert.equal(cinematic.filter((w) => w.attracts.includes('trailer')).length, 0);
});

test('dynamic (server-confirmed) rules are the hard tier and still strip', () => {
  setDynamicRules([{ word: 'velvet', substitute: 'soft-touch' }, { word: 'music box' }]);
  assert.equal(containsBannedWord('velvet texture'), true);
  assert.equal(filterBannedWords('velvet texture').text, 'soft-touch texture');
  assert.equal(filterBannedWords('eerie music box chime').text, 'eerie chime');
  // "!" exemption beats even confirmed rules (explicit user intent).
  assert.equal(filterBannedWords('!velvet texture').text, 'velvet texture');
  setDynamicRules([]);
  assert.equal(containsBannedWord('velvet texture'), false);
});

test('artist names still scrub — product policy, not folklore', () => {
  const { text, hits } = scrubArtistNames('like Metro Boomin at night', ['Metro Boomin']);
  assert.ok(!/metro boomin/i.test(text));
  assert.equal(hits.length, 1);
});
