/**
 * 🎲 Surprise Me — deterministic curated combinations. No LLM call.
 * Random region + era + key + BPM drawn from hand-curated pools that are
 * known to produce coherent results together.
 */

const COMBOS = [
  {
    region: 'Memphis', era: 'mid-90s underground', key: 'F minor', bpm: 134,
    genre: 'lo-fi Memphis phonk', feel: 'halftime feel',
    percussion: ['dark boxy drum hits tucked low', 'hats sizzle thin and distant'],
    lowEnd: ['distorted sub rumble, edges frayed'],
    lead: ['detuned bell melody, eerie and hollow'],
    room: ['basement tape haze'],
    feeling: ['menacing slow-creep pressure'],
  },
  {
    region: 'Queensbridge', era: 'mid-90s golden era', key: 'C minor', bpm: 92,
    genre: 'grimy east coast boom bap', feel: '',
    percussion: ['cracked snare hits square on the two and four', 'kick punches short and dry'],
    lowEnd: ['upright-style bassline walks low and dry'],
    lead: ['minor-key piano loop, dusty and close'],
    room: ['concrete stairwell echo, tight'],
    feeling: ['cold streetlight tension'],
  },
  {
    region: 'Atlanta', era: 'late-2000s trap', key: 'A minor', bpm: 140,
    genre: 'Atlanta crunk-trap', feel: 'halftime feel',
    percussion: ['low firm drum thump deep tucked', 'kick lands hard round on the one'],
    lowEnd: ['sub-bass deep fat low round clean short thumps'],
    lead: ['single dark synth lead stabs sharp blunt menacing'],
    room: ['vast minimalist, long open silence between phrases'],
    feeling: ['loud confrontational swagger'],
  },
  {
    region: 'Houston', era: 'late-90s screw era', key: 'E minor', bpm: 68,
    genre: 'chopped and slowed Houston lean', feel: '',
    percussion: ['drums drag heavy behind the pulse'],
    lowEnd: ['syrup-thick sub swells stretched long'],
    lead: ['pitched-down vocal chop smeared wide'],
    room: ['candy-paint car interior, close and padded'],
    feeling: ['slow-motion float, heavy eyelids'],
  },
  {
    region: 'Los Angeles', era: 'early-90s g-funk', key: 'G minor', bpm: 94,
    genre: 'west coast g-funk bounce', feel: '',
    percussion: ['snappy snare cracks laid-back off the grid'],
    lowEnd: ['round rubbery bassline slides between notes'],
    lead: ['high sine whistle lead glides portamento'],
    room: ['sunny open-top afternoon, wide stereo'],
    feeling: ['smooth low-rider glide'],
  },
  {
    region: 'Chicago', era: 'early-2010s drill', key: 'D minor', bpm: 142,
    genre: 'Chicago drill', feel: 'halftime feel',
    percussion: ['machine-gun hat rolls burst and stop', 'kick pattern stutters heavy'],
    lowEnd: ['sliding 808 growls between hits'],
    lead: ['icy music-box melody repeats unbothered'],
    room: ['dead night air, no reverb'],
    feeling: ['numb menace, matter-of-fact'],
  },
  {
    region: 'New York', era: '2016 Brooklyn drill lineage', key: 'B minor', bpm: 145,
    genre: 'Brooklyn drill', feel: 'halftime feel',
    percussion: ['skippy displaced kick pattern jumps the grid'],
    lowEnd: ['808 slides long and seasick'],
    lead: ['sparse gliding strings, cold and cinematic'],
    room: ['rooftop night wind, open'],
    feeling: ['reckless forward lurch'],
  },
  {
    region: 'Virginia', era: 'early-2000s', key: 'E-flat minor', bpm: 96,
    genre: 'stripped percussive machine-snap bounce', feel: '',
    percussion: ['rubber-band snare snaps dry, zero tail', 'clipped vocal grunts used as drums'],
    lowEnd: ['sub pulses in short staccato dots'],
    lead: ['single detuned synth stab, alien and plastic'],
    room: ['vacuum-sealed silence between hits'],
    feeling: ['funky robotic strut'],
  },
  {
    region: 'Detroit', era: 'late-2010s', key: 'F-sharp minor', bpm: 100,
    genre: 'Detroit bounce rap', feel: '',
    percussion: ['snare rushes early, hats swing drunk'],
    lowEnd: ['bassline bubbles busy and melodic'],
    lead: ['jittery bell riff circles nervously'],
    room: ['cramped basement party, sweaty'],
    feeling: ['hyper deadpan mischief'],
  },
  {
    region: 'New Orleans lineage', era: 'late-90s', key: 'C minor', bpm: 100,
    genre: 'southern bounce lineage block party', feel: '',
    percussion: ['rolling snare triplets circle the beat'],
    lowEnd: ['808 boom sustains under the whole bar'],
    lead: ['call-and-response chant cadence energy'],
    room: ['block party outdoors, crowd-close'],
    feeling: ['sweaty celebratory momentum'],
  },
];

/**
 * Pick a curated combo and return a ready interpretation object.
 * `rng` injectable for tests; defaults to Math.random.
 */
export function surpriseMe(rng = Math.random) {
  const combo = COMBOS[Math.floor(rng() * COMBOS.length)];
  return {
    genre_core: combo.genre,
    bpm: combo.bpm,
    bpm_feel: combo.feel,
    key: combo.key,
    key_emotion: '',
    arrangement: [],
    performance: [],
    percussion_physical: combo.percussion,
    low_end: combo.lowEnd,
    lead: combo.lead,
    room: combo.room,
    feeling: combo.feeling,
    exclusions: [],
    instrumental: true,
    vocal_direction: null,
    _surprise: { region: combo.region, era: combo.era },
  };
}

export const SURPRISE_COMBOS = COMBOS;
