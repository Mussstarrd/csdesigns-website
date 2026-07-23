import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGroove, budgetForStyle, bpmPhrase, GROOVE_STYLES } from '../groove.js';
import { renderSunoScaffold, renderMurekaStructure } from '../structureCanon.js';
import { buildPrompt } from '../buildPrompt.js';

const interp = {
  genre_core: 'dark Atlanta trap',
  bpm: 140,
  bpm_feel: 'half-time feel',
  key: 'A minor',
  key_emotion: 'sinister',
  arrangement: ['sparse arrangement'],
  performance: [],
  percussion_physical: ['hi-hat triplets machine-tight'],
  low_end: ['808 sub with long decay'],
  lead: ['reversed bell loop'],
  room: ['vast minimalist'],
  feeling: ['menacing'],
  exclusions: [],
  instrumental: true,
  vocal_direction: null,
};

test('bpmPhrase pairs number + feel (community canon)', () => {
  assert.equal(bpmPhrase(140, true), '140 BPM, half-time feel');
  assert.equal(bpmPhrase(92, false), '92 BPM');
});

test('three distinct groove vocabularies, no shared phrases', () => {
  const all = Object.values(GROOVE_STYLES).map((v) => v.phrases);
  const flat = all.flat();
  assert.equal(new Set(flat).size, flat.length);
});

test('space assignment only exists in the displaced style (A1 scoping)', () => {
  assert.ok(buildGroove({ style: 'displaced' }).spaceAssignment.length > 0);
  assert.equal(buildGroove({ style: 'pocket' }).spaceAssignment.length, 0);
  assert.equal(buildGroove({ style: 'forward' }).spaceAssignment.length, 0);
});

test('per-build budgets: pocket lean, displaced full ceiling', () => {
  assert.equal(budgetForStyle('pocket'), 350);
  assert.equal(budgetForStyle('displaced'), 990);
  assert.equal(budgetForStyle(null), 600);
});

test('buildPrompt injects groove into performance and respects budget', () => {
  const pocket = buildPrompt(interp, { groove: { style: 'pocket' } });
  assert.ok(pocket.suno.stylePrompt.includes('pocket groove'));
  assert.ok(pocket.suno.stylePrompt.includes('constant tempo'));
  assert.ok(pocket.suno.charCount <= 350, `pocket build ${pocket.suno.charCount} chars`);

  const displaced = buildPrompt(interp, { groove: { style: 'displaced' } });
  assert.ok(displaced.suno.stylePrompt.includes('808 decay and silence'));
  assert.ok(displaced.suno.charCount <= 990);
});

test('Suno scaffold: vocal hook-first with delivery cues, no parentheses', () => {
  const scaffold = renderSunoScaffold({
    instrumental: false,
    grooveStyle: 'displaced',
    beatSwitch: true,
  });
  const lines = scaffold.split('\n');
  assert.equal(lines[1], '[Hook]'); // hook-first: hook right after intro
  assert.ok(scaffold.includes('[Verse 1 — offset displaced flow]'));
  assert.ok(scaffold.includes('[Beat Switch]'));
  assert.ok(!scaffold.includes('('), 'parentheses get SUNG on Suno');
  assert.ok(!/\d+ bars/.test(scaffold), 'bar counts stay out of the Suno scaffold');
});

test('Suno scaffold: instrumental uses neutral section tags', () => {
  const scaffold = renderSunoScaffold({ instrumental: true });
  assert.ok(scaffold.includes('[Section A]'));
  assert.ok(!scaffold.includes('[Verse'));
});

test('Mureka structure carries bar counts (MusiCoT obeys them)', () => {
  const instrumental = renderMurekaStructure(interp, { energy: 4 });
  assert.ok(/\[Intro — 4 bars —/.test(instrumental.text), instrumental.text);
  const vocal = renderMurekaStructure({ ...interp, instrumental: false }, {});
  assert.ok(vocal.text.includes('[Hook — 8 bars'));
  assert.equal(vocal.templateId, 'hook-first');
  const switched = renderMurekaStructure({ ...interp, instrumental: false }, { beatSwitch: true });
  assert.ok(switched.text.includes('[Beat Switch — 4 bars'));
});

test('simplifyStructure (delta correction) reduces section count', () => {
  const full = renderMurekaStructure(interp, { energy: 4 });
  const simple = renderMurekaStructure(interp, { energy: 4, simplify: true });
  assert.ok(simple.text.split('\n').length < full.text.split('\n').length);
});
