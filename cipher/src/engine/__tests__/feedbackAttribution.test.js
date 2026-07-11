import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTerms,
  scoreSuspects,
  classifySuspect,
  suspectReport,
  isBadOutcome,
} from '../feedbackAttribution.js';
import {
  setDynamicRules,
  getDynamicRules,
  filterBannedWords,
  containsBannedWord,
} from '../bannedWords.js';

const ev = (promptText, rating, issues = [], unwantedText = null) => ({
  promptText,
  rating,
  issues,
  unwantedText,
});

test('extractTerms yields unigrams and bigrams, no stopwords or bare numbers', () => {
  const terms = extractTerms('140 BPM, velvet lead over the sub');
  assert.ok(terms.includes('velvet'));
  assert.ok(terms.includes('velvet lead'));
  assert.ok(!terms.includes('the'));
  assert.ok(!terms.includes('140'));
  assert.ok(!terms.includes('bpm'));
});

test('isBadOutcome: trash always bad; ok-with-issues bad; fire never bad', () => {
  assert.equal(isBadOutcome(ev('x', 'trash')), true);
  assert.equal(isBadOutcome(ev('x', 'ok', ['muddy_mix'])), true);
  assert.equal(isBadOutcome(ev('x', 'ok')), false);
  assert.equal(isBadOutcome(ev('x', 'fire', ['muddy_mix'])), false);
});

test('a term that only appears in trash generations rises to the top', () => {
  const events = [
    ev('dark trap, velvet texture, heavy sub', 'trash', ['unwanted_element'], 'saxophone'),
    ev('gritty drill, velvet texture, cold air', 'trash', ['unwanted_element'], 'saxophone'),
    ev('slow boom bap, velvet texture', 'trash', ['genre_drift']),
    ev('dark trap, heavy sub, cold air', 'fire'),
    ev('gritty drill, cold air', 'fire'),
  ];
  const suspects = scoreSuspects(events, { minOccurrences: 3 });
  const velvet = suspects.find((s) => s.term === 'velvet');
  assert.ok(velvet, 'velvet should be scored');
  assert.equal(velvet.bad, 3);
  assert.equal(velvet.good, 0);
  assert.equal(velvet.summons, 2);
  assert.equal(suspects[0].term.includes('velvet'), true, 'velvet terms rank first');
  // Terms that appear in fire generations too should score lower.
  const sub = suspects.find((s) => s.term === 'sub');
  assert.ok(!sub || sub.suspicion < velvet.suspicion);
});

test('minOccurrences gate keeps one-off noise out', () => {
  const suspects = scoreSuspects([ev('weird oneoff descriptor', 'trash')], {
    minOccurrences: 3,
  });
  assert.equal(suspects.length, 0);
});

test('bigrams never span comma-delimited descriptor segments', () => {
  const terms = extractTerms('dark trap, heavy sub');
  assert.ok(terms.includes('dark trap'));
  assert.ok(terms.includes('heavy sub'));
  assert.ok(!terms.includes('trap heavy'), 'bigram crossed a comma');
});

test('cold start: a named offender counts from a single occurrence', () => {
  const suspects = scoreSuspects(
    [ev('lonely descriptor here', 'trash', ['unwanted_element'], 'saxophone')],
    { minOccurrences: 3 }
  );
  const term = suspects.find((s) => s.term === 'lonely');
  assert.ok(term, 'summons evidence should bypass the minimum');
  assert.equal(term.summons, 1);
  assert.equal(classifySuspect(term), 'watch');
});

test('classification thresholds', () => {
  assert.equal(classifySuspect({ suspicion: 0.9, total: 5, summons: 0 }), 'hard-trigger');
  assert.equal(classifySuspect({ suspicion: 0.7, total: 3, summons: 2 }), 'hard-trigger');
  assert.equal(classifySuspect({ suspicion: 0.6, total: 3, summons: 0 }), 'watch');
  assert.equal(classifySuspect({ suspicion: 0.3, total: 10, summons: 0 }), 'clear');
});

test('suspectReport drops clear terms and attaches verdicts', () => {
  const events = [
    ev('velvet lead, heavy sub', 'trash', ['unwanted_element'], 'sax'),
    ev('velvet lead, cold air', 'trash', ['unwanted_element'], 'sax'),
    ev('velvet lead again', 'trash', []),
    ev('heavy sub, cold air', 'fire'),
    ev('heavy sub, cold air', 'fire'),
    ev('heavy sub, cold air', 'fire'),
  ];
  const report = suspectReport(events, { minOccurrences: 3 });
  assert.ok(report.some((s) => s.term === 'velvet' && s.verdict === 'hard-trigger'));
  assert.ok(!report.some((s) => s.term === 'heavy sub'));
});

test('dynamic rules extend the kill list at runtime and are removable', () => {
  setDynamicRules([
    { word: 'velvet', substitute: 'soft-touch' },
    { word: 'music box' }, // strip, no substitute
    { word: '' }, // invalid — skipped
  ]);
  assert.equal(getDynamicRules().length, 2);
  assert.equal(containsBannedWord('velvet texture'), true);
  assert.equal(filterBannedWords('velvet texture').text, 'soft-touch texture');
  assert.equal(filterBannedWords('eerie music box chime').text, 'eerie chime');
  // Static rules still work alongside.
  assert.equal(containsBannedWord('cowbell'), true);
  // Reset — later tests must not see dynamic rules.
  setDynamicRules([]);
  assert.equal(containsBannedWord('velvet texture'), false);
});
