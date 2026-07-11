import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cosineSimilarity,
  jaccardSimilarity,
  computeFreshness,
  freshnessBand,
  shouldWarnFreshness,
} from '../freshness.js';

test('cosine similarity basics', () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([], []), 0);
  assert.equal(cosineSimilarity([1], [1, 2]), 0); // dimension mismatch is safe
});

test('vector path: near-duplicate prompt scores red', () => {
  const v = Array.from({ length: 8 }, (_, i) => Math.sin(i + 1));
  const result = computeFreshness(
    { text: 'a', vector: v },
    [{ text: 'b', vector: v.map((x) => x * 1.0001) }]
  );
  assert.equal(result.approximate, false);
  assert.ok(result.score < 50);
  assert.equal(result.band, 'red');
});

test('first prompt ever is 100 fresh', () => {
  const result = computeFreshness({ text: 'anything' }, []);
  assert.equal(result.score, 100);
  assert.equal(result.band, 'green');
});

test('fallback to Jaccard when vectors missing, labeled approximate', () => {
  const result = computeFreshness(
    { text: 'gritty boom bap dusty piano loop' },
    [{ text: 'gritty boom bap dusty piano loop' }, { text: 'totally different trap' }]
  );
  assert.equal(result.approximate, true);
  assert.ok(result.score < 50);
});

test('memory window limits comparison set', () => {
  const dup = { text: 'same exact words here' };
  const recent = [
    { text: 'completely unrelated descriptors entirely' },
    dup, // outside window=1
  ];
  const result = computeFreshness(dup, recent, 1);
  assert.ok(result.score > 50, 'duplicate outside the window should not count');
});

test('bands: green 80-100, yellow 50-79, red <50', () => {
  assert.equal(freshnessBand(80), 'green');
  assert.equal(freshnessBand(79), 'yellow');
  assert.equal(freshnessBand(50), 'yellow');
  assert.equal(freshnessBand(49), 'red');
});

test('My Taste Protection warns at yellow; off warns only at red', () => {
  assert.equal(shouldWarnFreshness(65, true), true);
  assert.equal(shouldWarnFreshness(65, false), false);
  assert.equal(shouldWarnFreshness(40, false), true);
  assert.equal(shouldWarnFreshness(90, true), false);
});

test('jaccard ignores stopwords and case', () => {
  assert.ok(jaccardSimilarity('The Dark Trap', 'dark trap') > 0.9);
});
