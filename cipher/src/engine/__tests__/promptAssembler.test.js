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
    bpm_feel: 'halftime feel',
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

test('Prompt Stack order: BPM+feel, key+emotion, genre first; instrumental last', () => {
  const result = assembleSuno(baseInterpretation());
  assert.ok(result.stylePrompt.startsWith('140 BPM halftime feel, A minor sinister aggressive, Atlanta crunk-trap'));
  assert.ok(result.stylePrompt.endsWith(INSTRUMENTAL_TAG));
  // Arrangement before percussion, percussion before room, room before feeling.
  const idx = (s) => result.stylePrompt.indexOf(s);
  assert.ok(idx('stripped to lead') < idx('low firm drum thump'));
  assert.ok(idx('low firm drum thump') < idx('vast minimalist'));
  assert.ok(idx('vast minimalist') < idx('loud confrontational swagger'));
});

test('instrumental tag is absent for vocal tracks', () => {
  const interp = { ...baseInterpretation(), instrumental: false, vocal_direction: 'gritty' };
  const result = assembleSuno(interp);
  assert.ok(!result.stylePrompt.endsWith(INSTRUMENTAL_TAG));
});

test('hard 990-char ceiling: truncation drops trailing feeling descriptors first', () => {
  const interp = baseInterpretation();
  // Inflate: many long feeling descriptors + long room descriptors.
  interp.feeling = Array.from({ length: 30 }, (_, i) =>
    `overwhelming towering menace pressing down like a physical weight variation ${i}`
  );
  const result = assembleSuno(interp);
  assert.ok(result.charCount <= SUNO_HARD_CEILING, `count ${result.charCount}`);
  assert.ok(result.truncated.length > 0, 'something was truncated');
  // Front matter must survive intact.
  assert.ok(result.stylePrompt.startsWith('140 BPM halftime feel, A minor'));
  // Instrumental still last even after truncation.
  assert.ok(result.stylePrompt.endsWith(INSTRUMENTAL_TAG));
  // Dropped items must come from the tail (feeling), not the front (arrangement).
  assert.ok(result.truncated.every((t) => t.includes('menace') || t.includes('variation')));
  assert.ok(result.stylePrompt.includes('stripped to lead'));
});

test('exclusions never leak into the style prompt', () => {
  const result = assembleSuno(baseInterpretation());
  assert.ok(!/\bno snare slap\b/.test(result.stylePrompt));
  assert.equal(result.excludeField, 'no snare slap, no hats, no filler');
});

test('banned words from the LLM are filtered with warnings logged', () => {
  const interp = baseInterpretation();
  interp.lead = ['warm soulful horn lead with cowbell'];
  const result = assembleSuno(interp);
  assert.ok(!/cowbell|horn|soulful/i.test(result.stylePrompt));
  assert.ok(/velvet on skin/.test(result.stylePrompt)); // "warm" substituted
  assert.ok(result.warnings.some((w) => w.type === 'banned-word'));
});

test('artist names are scrubbed from descriptors', () => {
  const interp = baseInterpretation();
  interp.feeling = ['hard ATL energy like Future in his prime'];
  const result = assembleSuno(interp, { artistNames: ['Future', 'Metro Boomin'] });
  assert.ok(!/\bFuture\b/.test(result.stylePrompt));
  assert.ok(result.warnings.some((w) => w.type === 'artist-name'));
});

test('final assembled string never contains a banned trigger word', () => {
  const interp = baseInterpretation();
  interp.arrangement = ['epic orchestral pop build with brass swells'];
  interp.room = ['warm airy club'];
  const result = assembleSuno(interp);
  for (const banned of ['epic', 'orchestral pop', 'brass', 'airy']) {
    assert.ok(
      !result.stylePrompt.toLowerCase().includes(banned),
      `style prompt should not contain "${banned}"`
    );
  }
});
