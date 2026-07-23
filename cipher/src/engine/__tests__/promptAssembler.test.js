import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assembleSuno,
  SUNO_HARD_CEILING,
  INSTRUMENTAL_TAG,
} from '../promptAssembler.js';
import { validateInterpretation } from '../interpretationSchema.js';

const baseInterpretation = () =>
  validateInterpretation({
    genre_core: 'Atlanta crunk-trap',
    bpm: 140,
    bpm_feel: 'half-time feel',
    key: 'A minor',
    key_emotion: 'sinister aggressive',
    arrangement: ['stripped to lead + sub + kick', 'empty space as feature'],
    performance: ['swung triplet cadence', 'lands heavy on third beat behind the pulse'],
    percussion_physical: ['low firm drum thump deep tucked', 'kick lands hard round on the one'],
    low_end: ['sub-bass deep fat low round clean short thumps'],
    lead: ['single dark synth lead stabs sharp blunt menacing two-note figure'],
    room: ['vast minimalist', 'long open silence between phrases'],
    feeling: ['loud confrontational swagger', 'hard ATL energy'],
    exclusions: ['no snare slap', 'no hats', 'no filler'],
    instrumental: true,
    vocal_direction: null,
  }).interpretation;

test('v2 Prompt Stack: BPM+feel, key+emotion, genre, then instrumental EARLY', () => {
  const result = assembleSuno(baseInterpretation());
  assert.ok(
    result.stylePrompt.startsWith(
      `140 BPM half-time feel, A minor sinister aggressive, Atlanta crunk-trap, ${INSTRUMENTAL_TAG}`
    ),
    result.stylePrompt
  );
  // Section order preserved after the front matter.
  const idx = (s) => result.stylePrompt.indexOf(s);
  assert.ok(idx('stripped to lead') < idx('low firm drum thump'));
  assert.ok(idx('low firm drum thump') < idx('vast minimalist'));
  assert.ok(idx('vast minimalist') < idx('loud confrontational swagger'));
});

test('instrumental tag absent for vocal tracks', () => {
  const interp = { ...baseInterpretation(), instrumental: false, vocal_direction: 'gritty' };
  const result = assembleSuno(interp);
  assert.ok(!result.stylePrompt.includes(INSTRUMENTAL_TAG));
});

test('ceiling: truncation drops trailing feeling descriptors, never the front', () => {
  const interp = baseInterpretation();
  interp.feeling = Array.from({ length: 30 }, (_, i) =>
    `overwhelming towering menace pressing down like a physical weight variation ${i}`
  );
  const result = assembleSuno(interp);
  assert.ok(result.charCount <= SUNO_HARD_CEILING, `count ${result.charCount}`);
  assert.ok(result.truncated.length > 0);
  assert.ok(result.stylePrompt.startsWith('140 BPM half-time feel, A minor'));
  // Instrumental survives truncation because it lives in the front matter.
  assert.ok(result.stylePrompt.includes(INSTRUMENTAL_TAG));
  assert.ok(result.truncated.every((t) => t.includes('menace') || t.includes('variation')));
  assert.ok(result.stylePrompt.includes('stripped to lead'));
});

test('per-build budget truncates below the ceiling', () => {
  const result = assembleSuno(baseInterpretation(), { budget: 350 });
  assert.ok(result.charCount <= 350, `count ${result.charCount}`);
  assert.equal(result.budget, 350);
  assert.ok(result.stylePrompt.startsWith('140 BPM'));
});

test('exclusions never leak into the style prompt', () => {
  const result = assembleSuno(baseInterpretation());
  assert.ok(!/\bno snare slap\b/.test(result.stylePrompt));
  assert.equal(result.excludeField, 'no snare slap, no hats, no filler');
});

test('v2: watch-tier words survive in text but generate warnings', () => {
  const interp = baseInterpretation();
  interp.lead = ['warm soulful lead over the murk'];
  const result = assembleSuno(interp);
  assert.ok(result.stylePrompt.includes('warm soulful lead'), 'text untouched');
  const watchLabels = result.warnings.filter((w) => w.type === 'watch').map((w) => w.label);
  assert.ok(watchLabels.includes('warm'));
  assert.ok(watchLabels.includes('soulful'));
});

test('v2: attractor warnings fire for out-of-genre gravity words', () => {
  const interp = baseInterpretation();
  interp.lead = ['epic violin motif'];
  const result = assembleSuno(interp);
  assert.ok(result.stylePrompt.includes('epic violin motif'), 'text untouched');
  const attractors = result.warnings.filter((w) => w.type === 'attractor');
  assert.ok(attractors.some((w) => w.label.includes('violin')));
  // "epic" is at home in trap builds (safe when paired with a concrete
  // subgenre) — the bare-"epic" trailer warning is covered in bannedWords tests.
});

test('artist names are scrubbed from descriptors (hard policy)', () => {
  const interp = baseInterpretation();
  interp.feeling = ['hard ATL energy like Future in his prime'];
  const result = assembleSuno(interp, { artistNames: ['Future', 'Metro Boomin'] });
  assert.ok(!/\bFuture\b/.test(result.stylePrompt));
  assert.ok(result.warnings.some((w) => w.type === 'artist-name'));
});
