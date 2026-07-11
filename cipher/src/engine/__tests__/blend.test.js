import test from 'node:test';
import assert from 'node:assert/strict';
import { blendDna, textureDescriptorCount } from '../blend.js';

const foundation = {
  artist_name: 'A',
  bpm_min: 130,
  bpm_max: 150,
  key_preference: 'A minor',
  percussion_dna: ['kick lands hard round on the one', 'hat rolls burst tight'],
  low_end_dna: ['sub-bass deep fat clean short thumps'],
  lead_dna: ['foundation lead should not appear'],
  arrangement_dna: ['stripped to lead + sub + kick'],
  energy_dna: ['foundation energy should not appear'],
  room_dna: ['foundation room should not appear'],
  avoid_list: ['jazz chords', 'live drums'],
  anchor_tokens: ['Atlanta crunk-trap'],
};

const texture = {
  artist_name: 'B',
  bpm_min: 80,
  bpm_max: 95,
  key_preference: 'C major',
  percussion_dna: ['texture percussion should not appear'],
  low_end_dna: ['texture low end should not appear'],
  lead_dna: ['dusty minor-key piano loop', 'jazz chords voiced close', 'faint vinyl melody'],
  arrangement_dna: ['texture arrangement should not appear'],
  energy_dna: ['smoked-out reflective calm', 'late-night interior mood', 'weary hopeful glow'],
  room_dna: ['basement tape haze', 'small padded room'],
  avoid_list: ['808'],
  anchor_tokens: ['soul-sample haze'],
};

test('foundation contributes BPM, percussion, low end, exclusions', () => {
  const interp = blendDna(foundation, texture, 0.3);
  assert.equal(interp.bpm, 140); // midpoint of foundation range
  assert.ok(interp.percussion_physical.some((d) => d.includes('kick lands hard')));
  assert.ok(interp.low_end.some((d) => d.includes('sub-bass')));
  assert.deepEqual(interp.exclusions, ['jazz chords', 'live drums']);
  assert.ok(!interp.percussion_physical.some((d) => d.includes('texture')));
});

test('texture contributes lead, room, feeling only', () => {
  const interp = blendDna(foundation, texture, 0.3);
  assert.ok(interp.lead.some((d) => d.includes('piano loop') || d.includes('vinyl melody')));
  assert.ok(!interp.lead.some((d) => d.includes('foundation')));
  assert.ok(interp.room.some((d) => d.includes('haze') || d.includes('padded')));
  assert.ok(!interp.feeling.some((d) => d.includes('foundation')));
});

test("foundation's key wins", () => {
  const interp = blendDna(foundation, texture, 0.3);
  assert.equal(interp.key, 'A minor');
});

test("foundation's avoid list drops conflicting texture descriptors", () => {
  const interp = blendDna(foundation, texture, 0.4);
  // texture lead "jazz chords voiced close" conflicts with avoid "jazz chords"
  assert.ok(!interp.lead.some((d) => d.includes('jazz chords')));
});

test('flavor slider scales texture descriptor count, never structure', () => {
  assert.equal(textureDescriptorCount(0.1), 1);
  assert.equal(textureDescriptorCount(0.3), 2);
  assert.equal(textureDescriptorCount(0.4), 3);
  const low = blendDna(foundation, texture, 0.1);
  const high = blendDna(foundation, texture, 0.4);
  assert.ok(high.lead.length >= low.lead.length);
  // structural elements identical regardless of flavor
  assert.equal(low.bpm, high.bpm);
  assert.deepEqual(low.percussion_physical, high.percussion_physical);
  assert.deepEqual(low.exclusions, high.exclusions);
});
