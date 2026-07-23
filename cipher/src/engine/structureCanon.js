/**
 * Structure translation layer (A5 of docs/V2_SPEC.md).
 *
 * ONE canonical structure — built from hit-record analysis — rendered into
 * each platform's structural language:
 *   Suno   → bracket-tag scaffold for the LYRICS field (tags are
 *            probabilistic hints; 1–3 words; delivery cues in brackets;
 *            NEVER parentheses — Suno sings parenthesized text).
 *   Mureka → bar-annotated structure block (MusiCoT plans structure before
 *            audio and honors bar counts).
 *
 * Hit-structure data encoded here: hook-first (73–86% of charting rap),
 * first hook ≤20s, ~2:30–2:50 target runtime, hook ≥3 exposures with the
 * final one doubled, optional beat-switch at ~2/3 as the retention spike.
 */

import { buildStructureBlock } from './structureTemplates.js';

// Canonical vocal templates. Bars assume ~4 beats/bar at 85–150 BPM —
// an 8-bar hook lands the first chorus inside the ≤20s window.
export const VOCAL_CANON = {
  'hook-first': [
    { tag: 'Intro', bars: 2, note: 'beat establishes, sparse' },
    { tag: 'Hook', bars: 8, note: 'full arrangement — arrives inside 20 seconds' },
    { tag: 'Verse 1', bars: 12, note: 'stripped for the vocal' },
    { tag: 'Hook', bars: 8 },
    { tag: 'Verse 2', bars: 12 },
    { tag: 'Bridge', bars: 4, note: 'texture change, not a big build' },
    { tag: 'Hook', bars: 8, note: 'final, doubled energy' },
    { tag: 'Outro', bars: 2 },
  ],
  'beat-switch': [
    { tag: 'Intro', bars: 2 },
    { tag: 'Hook', bars: 8, note: 'arrives inside 20 seconds' },
    { tag: 'Verse 1', bars: 12 },
    { tag: 'Hook', bars: 8 },
    { tag: 'Beat Switch', bars: 4, note: 'new drums, new energy — the retention spike' },
    { tag: 'Verse 2', bars: 12, note: 'over the switched beat' },
    { tag: 'Hook', bars: 8, note: 'final, doubled' },
    { tag: 'Outro', bars: 2 },
  ],
};

/** Delivery cue derived from the build's groove style (D5). */
function deliveryCue(grooveStyle) {
  if (grooveStyle === 'displaced') return 'offset displaced flow';
  if (grooveStyle === 'pocket') return 'laid-back pocket flow';
  if (grooveStyle === 'forward') return 'aggressive forward flow';
  return null;
}

/**
 * Suno LYRICS-field scaffold. Structure-only — no lyric content (out of
 * scope). For vocal tracks: canonical template with delivery cues. For
 * instrumentals: neutral section tags that shape arrangement without words.
 */
export function renderSunoScaffold({
  instrumental = true,
  grooveStyle = null,
  beatSwitch = false,
} = {}) {
  if (instrumental) {
    const lines = [
      '[Intro]',
      '[Build]',
      '[Section A]',
      beatSwitch ? '[Beat Switch]' : '[Break]',
      '[Section B]',
      '[Outro]',
    ];
    return lines.join('\n');
  }
  const canon = VOCAL_CANON[beatSwitch ? 'beat-switch' : 'hook-first'];
  const cue = deliveryCue(grooveStyle);
  return canon
    .map(({ tag }) => {
      const isVerse = /^Verse/.test(tag);
      return isVerse && cue ? `[${tag} — ${cue}]` : `[${tag}]`;
    })
    .join('\n');
}

/**
 * Mureka structure block, bar-annotated. Vocal tracks render the canonical
 * template; instrumentals reuse the genre/energy template library with bar
 * counts injected. `simplify` (delta-loop structure_ignored correction)
 * drops to the four load-bearing sections.
 */
export function renderMurekaStructure(interpretation, options = {}) {
  const { energy = 3, beatSwitch = false, simplify = false } = options;

  if (interpretation?.instrumental === false) {
    let canon = VOCAL_CANON[beatSwitch ? 'beat-switch' : 'hook-first'];
    if (simplify) canon = canon.filter(({ tag }) => /Hook|Verse|Intro|Outro/.test(tag)).slice(0, 5);
    const text = canon
      .map(({ tag, bars, note }) =>
        note ? `[${tag} — ${bars} bars — ${note}]` : `[${tag} — ${bars} bars]`
      )
      .join('\n');
    return { templateId: beatSwitch ? 'beat-switch' : 'hook-first', text };
  }

  // Instrumental: genre/energy template + default bar counts per section tag.
  const base = buildStructureBlock(interpretation, energy);
  const BAR_DEFAULTS = [
    [/^\[Intro/i, 4],
    [/^\[Verse/i, 12],
    [/^\[(Chorus|Hook)/i, 8],
    [/^\[(Bridge|Break|Pre-Chorus|Beat Switch)/i, 4],
    [/^\[Outro/i, 4],
  ];
  let lines = base.text.split('\n').map((line) => {
    const rule = BAR_DEFAULTS.find(([re]) => re.test(line));
    if (!rule) return line;
    return line.replace(/^\[([^\]—]+?)\s*—\s*/, (m, tag) => `[${tag.trim()} — ${rule[1]} bars — `);
  });
  if (simplify && lines.length > 4) {
    lines = [lines[0], lines[1], lines[2], lines[lines.length - 1]];
  }
  return { templateId: base.templateId, text: lines.join('\n') };
}
