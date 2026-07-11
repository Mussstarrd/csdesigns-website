/**
 * Build It chip data — REGION-ERA, VIBE, and PRODUCTION STYLE chips.
 * Each chip contributes a partial DNA fragment; buildFromChips() in the
 * engine merges fragments deterministically (no LLM call, ever).
 */

export const REGION_ERA_CHIPS = [
  {
    id: 'nyc-90s',
    label: 'NYC 90s',
    genre: 'dusty 90s New York boom bap',
    bpm_min: 86,
    bpm_max: 96,
    key_preference: 'C minor',
    percussion_dna: ['cracked snare square on the two and four', 'dusty chopped drum break'],
    low_end_dna: ['dry walking bassline under the loop'],
    room_dna: ['concrete stairwell closeness'],
  },
  {
    id: 'atl-2010s',
    label: 'ATL 2010s',
    genre: 'dark Atlanta trap',
    bpm_min: 130,
    bpm_max: 150,
    key_preference: 'F minor',
    percussion_dna: ['hat rolls burst machine-tight', 'snare drags late and lazy'],
    low_end_dna: ['808 sustains long, notes bending downward'],
    room_dna: ['vast minimalist space'],
  },
  {
    id: 'memphis-90s',
    label: 'Memphis 90s',
    genre: 'occult lo-fi Memphis',
    bpm_min: 128,
    bpm_max: 144,
    key_preference: 'F minor',
    percussion_dna: ['boxy drum-machine hits saturated by cassette dub'],
    low_end_dna: ['overdriven 808 boom, edges furred'],
    room_dna: ['tape-hiss basement haze'],
  },
  {
    id: 'westcoast-90s',
    label: 'West Coast 90s',
    genre: 'west coast g-funk bounce',
    bpm_min: 88,
    bpm_max: 98,
    key_preference: 'G minor',
    percussion_dna: ['snappy snare laid back off the grid'],
    low_end_dna: ['round rubbery bassline sliding between notes'],
    room_dna: ['sunny open-top afternoon, wide stereo'],
  },
  {
    id: 'houston-90s',
    label: 'Houston Screw',
    genre: 'chopped and slowed Houston lean',
    bpm_min: 62,
    bpm_max: 76,
    key_preference: 'E minor',
    percussion_dna: ['drums drag heavy behind the pulse'],
    low_end_dna: ['syrup-thick sub swells stretched long'],
    room_dna: ['candy-paint car interior, padded'],
  },
  {
    id: 'chicago-drill',
    label: 'Chicago Drill',
    genre: 'Chicago drill',
    bpm_min: 138,
    bpm_max: 146,
    key_preference: 'D minor',
    percussion_dna: ['machine-gun hat bursts, stop-start', 'stuttering heavy kick pattern'],
    low_end_dna: ['sliding 808 growls between hits'],
    room_dna: ['dead night air, no reverb'],
  },
  {
    id: 'uk-drill',
    label: 'UK Drill',
    genre: 'UK drill',
    bpm_min: 138,
    bpm_max: 148,
    key_preference: 'C-sharp minor',
    percussion_dna: ['skippy displaced kick pattern jumping the grid', 'snare cracks on the three'],
    low_end_dna: ['808 slides long and seasick'],
    room_dna: ['cold concrete estate air'],
  },
  {
    id: 'detroit-2010s',
    label: 'Detroit',
    genre: 'Detroit bounce rap',
    bpm_min: 96,
    bpm_max: 106,
    key_preference: 'F-sharp minor',
    percussion_dna: ['snare rushes early, hats swung drunk'],
    low_end_dna: ['busy melodic bassline bubbling under everything'],
    room_dna: ['cramped basement party air'],
  },
];

export const VIBE_CHIPS = [
  { id: 'menacing', label: 'Menacing', feeling: ['cold quiet menace', 'threat delivered flat'], key_emotion: 'sinister' },
  { id: 'triumphant', label: 'Triumphant', feeling: ['victory-lap confidence', 'chest-out arrival energy'], key_emotion: 'regal' },
  { id: 'melancholy', label: 'Melancholy', feeling: ['3am heartbreak reflection', 'rain-on-glass sadness'], key_emotion: 'mournful' },
  { id: 'aggressive', label: 'Aggressive', feeling: ['confrontational forward pressure', 'clenched-jaw intensity'], key_emotion: 'violent' },
  { id: 'smooth', label: 'Smooth', feeling: ['silk-glide nonchalance', 'designer calm'], key_emotion: 'liquid' },
  { id: 'eerie', label: 'Eerie', feeling: ['horror-film unease', 'abandoned-house stillness'], key_emotion: 'haunted' },
  { id: 'gritty', label: 'Gritty', feeling: ['concrete-and-winter grit', 'unpolished street documentary'], key_emotion: 'raw' },
  { id: 'spacey', label: 'Spacey', feeling: ['orbit-wide drift', 'extraterrestrial calm'], key_emotion: 'weightless' },
];

export const PRODUCTION_STYLE_CHIPS = [
  {
    id: 'sparse-minimal',
    label: 'Sparse & Minimal',
    arrangement: ['stripped to lead + sub + kick', 'empty space as a feature'],
    room: ['long open silence between phrases'],
  },
  {
    id: 'sample-driven',
    label: 'Sample-Driven',
    arrangement: ['chopped sample rearranged into new chord movement', 'loop filtered low for verses'],
    room: ['crate-dust texture on everything'],
  },
  {
    id: 'wall-of-sound',
    label: 'Wall of Sound',
    arrangement: ['layers stacked dense, every register occupied'],
    room: ['arena-scale depth of field'],
  },
  {
    id: 'live-feel',
    label: 'Live Feel',
    arrangement: ['band-feel arrangement, instruments trade fills'],
    performance: ['played not programmed, ghost notes everywhere'],
    room: ['live room, mics bleeding into each other'],
  },
  {
    id: 'distorted',
    label: 'Distorted & Raw',
    arrangement: ['full intensity from bar one, no build'],
    performance: ['red-lined edges on every element'],
    room: ['signal-clipped airless mix'],
  },
  {
    id: 'atmospheric',
    label: 'Atmospheric',
    arrangement: ['elements fade in and out of the haze'],
    room: ['reverb tails stretching into black', 'soft-focus wide field'],
  },
];

export const KEY_OPTIONS = [
  'Auto',
  'A minor', 'B-flat minor', 'B minor', 'C minor', 'C-sharp minor', 'D minor',
  'E-flat minor', 'E minor', 'F minor', 'F-sharp minor', 'G minor', 'A-flat minor',
  'C major', 'D major', 'E-flat major', 'F major', 'G major', 'A-flat major', 'B-flat major',
];
