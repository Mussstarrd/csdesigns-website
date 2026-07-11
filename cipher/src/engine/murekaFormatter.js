/**
 * Mureka V9 formatter — separate from the Suno assembler.
 *
 * Differences enforced here:
 *  - Music Style field carries the same tag content, but BPM is converted to
 *    a FEEL DESCRIPTOR only ("sluggish halftime pace", not "140 BPM") —
 *    Mureka ignores raw numbers.
 *  - Vocal Direction is its own field (null when instrumental).
 *  - A Structure Block is ALWAYS output (even instrumentals): Mureka's
 *    MusiCoT engine plans arrangement from structure tags.
 */

import { filterBannedWords, scrubArtistNames } from './bannedWords.js';
import { buildStructureBlock } from './structureTemplates.js';

/**
 * Convert BPM (+ feel hint) into Mureka feel language. Deterministic table —
 * numbers never appear in the output.
 */
export function bpmToFeel(bpm, bpmFeel = '') {
  const feel = String(bpmFeel ?? '').toLowerCase();
  const halftime = feel.includes('halftime');
  if (!bpm) return feel || 'steady mid pace';
  if (bpm < 75) return 'crawling, weighted pace';
  if (bpm < 96) return halftime ? 'dragging halftime crawl' : 'laid-back head-nod pace';
  if (bpm < 116) return halftime ? 'heavy halftime lean' : 'steady rolling mid pace';
  if (bpm < 136) return halftime ? 'thick halftime bounce' : 'driving forward pace';
  if (bpm < 156) return halftime ? 'sluggish halftime pace' : 'urgent double-time pressure';
  return halftime ? 'frantic surface over a halftime floor' : 'frantic sprinting pace';
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

  const structure = buildStructureBlock(interp, energy);

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
