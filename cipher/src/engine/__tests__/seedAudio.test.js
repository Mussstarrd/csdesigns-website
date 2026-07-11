import test from 'node:test';
import assert from 'node:assert/strict';
import { applySeedAudioContext } from '../seedAudio.js';

const interp = {
  genre_core: 'boom bap',
  arrangement: ['loop-driven'],
  percussion_physical: ['cracked snare on the two and four'],
  low_end: ['dry upright-style bassline'],
  lead: ['dusty piano loop'],
  room: [],
  feeling: [],
  exclusions: [],
  instrumental: false,
  vocal_direction: 'raspy close delivery',
};

test('audio contains drums → percussion omitted, complement added', () => {
  const { interpretation } = applySeedAudioContext(interp, ['drums']);
  assert.deepEqual(interpretation.percussion_physical, []);
  assert.ok(
    interpretation.arrangement.some((a) => a.includes('follows the uploaded rhythm'))
  );
  // other categories untouched
  assert.deepEqual(interpretation.low_end, interp.low_end);
  assert.deepEqual(interpretation.lead, interp.lead);
});

test('bass and melody omit their categories', () => {
  const { interpretation } = applySeedAudioContext(interp, ['bass', 'melody']);
  assert.deepEqual(interpretation.low_end, []);
  assert.deepEqual(interpretation.lead, []);
  assert.deepEqual(interpretation.percussion_physical, interp.percussion_physical);
});

test('vocals in audio clears vocal_direction', () => {
  const { interpretation } = applySeedAudioContext(interp, ['vocals']);
  assert.equal(interpretation.vocal_direction, null);
});

test('no categories → untouched', () => {
  const { interpretation, complements } = applySeedAudioContext(interp, []);
  assert.equal(interpretation, interp);
  assert.equal(complements.length, 0);
});
