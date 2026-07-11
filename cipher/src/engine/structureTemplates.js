/**
 * Mureka Structure Block templates.
 *
 * Mureka V9's MusiCoT engine plans arrangement from lyric-structure tags, so
 * CIPHER always outputs a structure block — even for instrumentals. Templates
 * vary by genre family and energy level (1–5); the assembler picks one and
 * injects the track's actual element names into the brackets.
 *
 * Placeholders: {sub} {kick} {perc} {lead} — replaced with short element
 * names derived from the interpretation JSON (falling back to generic names).
 */

const TEMPLATES = [
  {
    id: 'trap-high',
    genres: ['trap', 'crunk', 'drill', 'rage'],
    energy: [4, 5],
    lines: [
      '[Intro — sparse, {sub} and {kick} only]',
      '[Verse — heavy {sub}, {perc} enters]',
      '[Chorus — full arrangement, {lead} dominant]',
      '[Verse — stripped back to Verse 1 elements]',
      '[Chorus — full arrangement]',
      '[Outro — elements exit one by one, {sub} last]',
    ],
  },
  {
    id: 'trap-low',
    genres: ['trap', 'drill'],
    energy: [1, 2, 3],
    lines: [
      '[Intro — {lead} alone, distant]',
      '[Verse — {kick} and {sub} enter under {lead}]',
      '[Chorus — {perc} fills in, weight doubles]',
      '[Bridge — drums drop out, {lead} exposed]',
      '[Verse — full rhythm section returns]',
      '[Outro — long fade, {sub} decays alone]',
    ],
  },
  {
    id: 'boombap-high',
    genres: ['boom bap', 'east coast', 'hardcore hip hop'],
    energy: [4, 5],
    lines: [
      '[Intro — {perc} loop chopped, one bar exposed]',
      '[Verse — {kick} and {sub} lock the loop down]',
      '[Chorus — {lead} rides on top, cuts and stabs]',
      '[Verse — loop filtered low, drums untouched]',
      '[Chorus — full loop returns, {lead} doubled]',
      '[Outro — beat runs dry, {perc} last to leave]',
    ],
  },
  {
    id: 'boombap-low',
    genres: ['boom bap', 'jazz rap', 'lo-fi hip hop', 'east coast'],
    energy: [1, 2, 3],
    lines: [
      '[Intro — {lead} loop alone, dusty]',
      '[Verse — {kick} enters soft, {sub} underneath]',
      '[Chorus — {perc} lifts, loop opens up]',
      '[Verse — back to sparse loop and drums]',
      '[Outro — loop plays out, drums exit first]',
    ],
  },
  {
    id: 'southern-bounce',
    genres: ['bounce', 'memphis', 'houston', 'chopped', 'crunk', 'southern'],
    energy: [3, 4, 5],
    lines: [
      '[Intro — {perc} pattern alone, hard count-in]',
      '[Verse — {sub} drops on the one, full weight]',
      '[Chorus — chant-cadence energy, {lead} stabs]',
      '[Verse — {sub} and {kick} carry, {lead} out]',
      '[Chorus — everything in, maximum pressure]',
      '[Outro — sudden strip to {kick}, then silence]',
    ],
  },
  {
    id: 'westcoast-groove',
    genres: ['g-funk', 'west coast', 'gangsta'],
    energy: [2, 3, 4],
    lines: [
      '[Intro — {lead} glides in over {kick}]',
      '[Verse — {sub} rolls deep, pocket settles]',
      '[Chorus — {lead} takes the top line]',
      '[Verse — groove unchanged, small variations]',
      '[Chorus — {lead} doubled an octave up]',
      '[Outro — {lead} rides out, drums fade under]',
    ],
  },
  {
    id: 'ambient-minimal',
    genres: ['ambient', 'cloud rap', 'minimal', 'atmospheric'],
    energy: [1, 2],
    lines: [
      '[Intro — {lead} texture builds slowly from silence]',
      '[Verse — {kick} pulse enters, barely there]',
      '[Chorus — {sub} swells, space stays open]',
      '[Bridge — all rhythm out, pure {lead} texture]',
      '[Outro — long decay into silence]',
    ],
  },
  {
    id: 'anthem-build',
    genres: ['anthem', 'stadium', 'festival', 'hype'],
    energy: [4, 5],
    lines: [
      '[Intro — {lead} motif stated once, dry]',
      '[Verse — {kick} four on the floor of pressure, {sub} under]',
      '[Pre-Chorus — {perc} doubles, tension climbs]',
      '[Chorus — full drop, every element in]',
      '[Verse — stripped to {sub} and vocal space]',
      '[Chorus — final drop, extended]',
      '[Outro — crowd-sized silence, one last {kick}]',
    ],
  },
  {
    id: 'soul-loop',
    genres: ['soul', 'chipmunk soul', 'sample-based', 'chicago'],
    energy: [2, 3, 4],
    lines: [
      '[Intro — {lead} sample loop, unfiltered, two bars]',
      '[Verse — {kick} and {sub} anchor the loop]',
      '[Chorus — loop opens full range, {perc} lifts]',
      '[Verse — loop filtered, drums carry]',
      '[Chorus — full loop, layered]',
      '[Outro — sample plays out alone, tape stop]',
    ],
  },
  {
    id: 'default',
    genres: [],
    energy: [1, 2, 3, 4, 5],
    lines: [
      '[Intro — sparse, {sub} and {kick} only]',
      '[Verse — {perc} enters, weight builds]',
      '[Chorus — full arrangement, {lead} dominant]',
      '[Verse — stripped back to Verse 1 elements]',
      '[Chorus — full arrangement]',
      '[Outro — elements exit one by one, {sub} last]',
    ],
  },
];

// Words that start the "what it does" half of a descriptor — element names
// stop before them so "808 sustains long and syrup-thick" becomes "808".
const VERBISH = new Set([
  'lands', 'land', 'landing', 'sustains', 'stutter', 'stutters', 'floods',
  'drifts', 'drifting', 'dripping', 'wobbling', 'smear', 'smears', 'enters',
  'hits', 'hitting', 'punches', 'rolls', 'rolling', 'slides', 'sliding',
  'bends', 'bending', 'tucked', 'mixed', 'tuned', 'ride', 'rides', 'riding',
  'swells', 'plucks', 'stabs', 'circles', 'circling', 'hums', 'hanging',
  'sits', 'sitting', 'walks', 'cracks', 'snaps', 'thuds', 'bounces',
]);

/** Derive short element names from the interpretation JSON. */
export function deriveElementNames(interpretation = {}) {
  const first = (arr, fallback) => {
    const v = Array.isArray(arr) && arr.length ? String(arr[0]) : '';
    // Keep element names short: up to 3 words, stopping before verbs.
    const words = [];
    for (const w of v.split(/\s+/).filter(Boolean)) {
      if (words.length > 0 && VERBISH.has(w.toLowerCase())) break;
      words.push(w);
      if (words.length === 3) break;
    }
    return words.join(' ') || fallback;
  };
  return {
    sub: first(interpretation.low_end, 'sub'),
    kick: 'kick',
    perc: first(interpretation.percussion_physical, 'percussion'),
    lead: first(interpretation.lead, 'lead'),
  };
}

/** Pick a template by genre text + energy (1–5), inject element names. */
export function buildStructureBlock(interpretation = {}, energy = 3) {
  const genreText = String(interpretation.genre_core ?? '').toLowerCase();
  const level = Math.min(5, Math.max(1, Math.round(energy || 3)));

  let pick = TEMPLATES.find(
    (t) => t.genres.some((g) => genreText.includes(g)) && t.energy.includes(level)
  );
  if (!pick) pick = TEMPLATES.find((t) => t.genres.some((g) => genreText.includes(g)));
  if (!pick) pick = TEMPLATES.find((t) => t.id === 'default');

  const names = deriveElementNames(interpretation);
  const lines = pick.lines.map((line) =>
    line.replace(/\{(sub|kick|perc|lead)\}/g, (_, key) => names[key])
  );
  return { templateId: pick.id, text: lines.join('\n') };
}

export const STRUCTURE_TEMPLATES = TEMPLATES;
