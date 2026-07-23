/**
 * Mureka V9 formatter — separate from the Suno assembler.
 *
 * Differences enforced here:
 *  - Music Style field carries the same tag content, but BPM leads with a
 *    FEEL DESCRIPTOR ("sluggish half-time pace") — numeric-BPM adherence on
 *    Mureka is unverified (v2 research), so feel words are the primary lever.
 *  - Vocal Direction is its own field (null when instrumental).
 *  - A Structure Block is ALWAYS output (even instrumentals): Mureka's
 *    MusiCoT engine plans arrangement from structure tags.
 */

import { filterBannedWords, scrubArtistNames } from './bannedWords.js';
import { renderMurekaStructure } from './structureCanon.js';

/**
 * Convert BPM (+ feel hint) into Mureka feel language. Deterministic table —
 * numbers never appear in the output.
 */
export function bpmToFeel(bpm, bpmFeel = '') {
  const feel = String(bpmFeel ?? '').toLowerCase();
  const halfTime = /half-?time/.test(feel);
  if (!bpm) return feel || 'steady mid pace';
  if (bpm < 75) return 'crawling, weighted pace';
  if (bpm < 96) return halfTime ? 'dragging half-time crawl' : 'laid-back head-nod pace';
  if (bpm < 116) return halfTime ? 'heavy half-time lean' : 'steady rolling mid pace';
  if (bpm < 136) return halfTime ? 'thick half-time bounce' : 'driving forward pace';
  if (bpm < 156) return halfTime ? 'sluggish half-time pace' : 'urgent double-time pressure';
  return halfTime ? 'frantic surface over a half-time floor' : 'frantic sprinting pace';
}

/**
 * Assemble the Mureka output. Returns {
 *   musicStyle, vocalDirection, structureBlock, tempoFeel,
 *   charCount, warnings
 * }
 */
export function assembleMureka(interpretation, options = {}) {
  const interp = interpretation ?? {};
  const artistNames = options.artistNames ?? [];
  const energy = options.energy ?? 3;
  const warnings = [];

  const clean = (text) => {
    const banned = filterBannedWords(text);
    banned.hits.forEach((h) => warnings.push({ type: 'banned-word', ...h }));
    const scrubbed = scrubArtistNames(banned.text, artistNames);
    scrubbed.hits.forEach((h) => warnings.push({ type: 'artist-name', ...h }));
    return scrubbed.text;
  };

  const tempoFeel = clean(bpmToFeel(interp.bpm, interp.bpm_feel));

  // Music Style: tempo feel + key emotion + genre + descriptor stack.
  // Same content order as Suno, minus raw numbers.
  const parts = [
    tempoFeel,
    [interp.key, interp.key_emotion].filter(Boolean).join(' '),
    interp.genre_core,
    ...(interp.arrangement ?? []),
    ...(interp.performance ?? []),
    ...(interp.percussion_physical ?? []),
    ...(interp.low_end ?? []),
    ...(interp.lead ?? []),
    ...(interp.room ?? []),
    ...(interp.feeling ?? []),
  ];
  const musicStyle = parts.map(clean).filter(Boolean).join(', ');

  const vocalDirection =
    interp.instrumental === true || !interp.vocal_direction
      ? null
      : clean(interp.vocal_direction);

  const structure = renderMurekaStructure(interp, {
    energy,
    beatSwitch: options.beatSwitch === true,
    simplify: options.simplifyStructure === true,
  });

  return {
    musicStyle,
    vocalDirection,
    structureBlock: structure.text,
    structureTemplateId: structure.templateId,
    tempoFeel,
    charCount: musicStyle.length,
    warnings,
  };
}
