import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSuno, charCountBand } from '../validator.js';
import { trafficLightState, cetHour } from '../trafficLight.js';
import { parseInterpretationResponse } from '../interpretationSchema.js';
import { surpriseMe, SURPRISE_COMBOS } from '../surpriseMe.js';
import { containsBannedWord } from '../bannedWords.js';
import { assembleSuno } from '../promptAssembler.js';

test('char counter bands: green <900, yellow 900-970, red >970', () => {
  assert.equal(charCountBand(899), 'green');
  assert.equal(charCountBand(900), 'yellow');
  assert.equal(charCountBand(970), 'yellow');
  assert.equal(charCountBand(971), 'red');
});

test('validateSuno: hard errors block, watch words only warn (v2)', () => {
  const over = validateSuno({ stylePrompt: 'x'.repeat(1001) });
  assert.equal(over.ok, false);

  // v2: cowbell is watch-tier — valid prompt, with a warning.
  const watch = validateSuno({ stylePrompt: 'dark trap with cowbell' });
  assert.equal(watch.ok, true);
  assert.ok(watch.warnings.some((w) => w.includes('cowbell')));

  const tooMany = validateSuno({
    stylePrompt: 'dark ambient',
    excludeField: 'no a, no b, no c, no d, no e, no f',
  });
  assert.equal(tooMany.ok, false);
});

test('validateSuno warns when instrumental missing from the front segment', () => {
  const missing = validateSuno({
    stylePrompt: 'dark trap groove, heavy 808s',
    instrumental: true,
  });
  assert.ok(missing.warnings.some((w) => w.includes('front-loaded')));

  const present = validateSuno({
    stylePrompt: '140 BPM, dark trap, instrumental, no vocals, heavy 808s',
    instrumental: true,
  });
  assert.ok(!present.warnings.some((w) => w.includes('front-loaded')));
});

test('traffic light windows over CET hours', () => {
  // Build dates at explicit CET hours via UTC (CET = UTC+1 in winter).
  const atCet = (h) => new Date(Date.UTC(2026, 0, 15, (h - 1 + 24) % 24, 30));
  assert.equal(cetHour(atCet(13)), 13);
  assert.equal(trafficLightState(atCet(13)).state, 'red');
  assert.equal(trafficLightState(atCet(3)).state, 'green');
  assert.equal(trafficLightState(atCet(9)).state, 'yellow');
  assert.equal(trafficLightState(atCet(23)).state, 'yellow');
});

test('parseInterpretationResponse tolerates markdown fences and prose', () => {
  const { interpretation } = parseInterpretationResponse(
    'Here you go:\n```json\n{"genre_core":"dark trap","bpm":140,"instrumental":true}\n```'
  );
  assert.equal(interpretation.genre_core, 'dark trap');
  assert.equal(interpretation.bpm, 140);
});

test('parseInterpretationResponse never throws on garbage', () => {
  const { interpretation, problems } = parseInterpretationResponse('not json at all');
  assert.equal(interpretation.genre_core, '');
  assert.ok(problems.length > 0);
});

test('every Surprise Me combo assembles clean and under the ceiling', () => {
  for (let i = 0; i < SURPRISE_COMBOS.length; i++) {
    const interp = surpriseMe(() => i / SURPRISE_COMBOS.length);
    const result = assembleSuno(interp);
    assert.ok(result.charCount <= 990, `combo ${i} over ceiling`);
    assert.equal(containsBannedWord(result.stylePrompt), false, `combo ${i} has banned word`);
  }
});
