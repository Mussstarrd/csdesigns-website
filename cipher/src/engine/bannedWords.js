/**
 * Ruleset v2 — evidence-tiered word rules. (D1/A1 of docs/V2_SPEC.md)
 *
 * v1 shipped a large hard kill list that silently stripped words. The July
 * 2026 research round showed most of it was folklore — and some of it
 * (swing, shuffle, half-time) was actively destroying groove language. v2:
 *
 *   HARD tier    — verified-destructive rules only. Today that is: artist
 *                  names (product policy) and server-confirmed dynamic rules
 *                  from the Learning System. These are still stripped.
 *   WATCH tier   — the former kill list, demoted. Warn-only, never stripped.
 *                  Silent stripping is how v1 folklore calcified; warnings
 *                  generate telemetry the Learning System can adjudicate.
 *   ATTRACTORS   — the verified mechanism: genre-defining instruments and
 *                  bare superlatives drag their whole genre in with them.
 *                  Contextual warnings when the pull conflicts with the
 *                  build's genre core.
 *
 * The `!` exemption prefix suppresses both tiers for a word ("!brass").
 */

// ---------------------------------------------------------------------------
// WATCH tier — warn, never strip. Former v1 kill list, demoted to hypotheses.
// `note` explains the suspicion; `context` names when it MIGHT matter.
const WATCH_RULES = [
  { label: 'cowbell', pattern: /\bcowbells?\b/gi, note: 'associated with phonk/Memphis pull', context: 'outside phonk builds' },
  { label: 'woodblock', pattern: /\bwood\s?blocks?\b/gi, note: 'stock-percussion folklore (unverified)' },
  { label: 'rim shot', pattern: /\brim\s?shots?\b/gi, note: 'stock-percussion folklore (unverified)' },
  { label: 'reed', pattern: /\breeds?\b/gi, note: 'stock-sample folklore (unverified)' },
  { label: 'clave', pattern: /\bclaves?\b/gi, note: 'latin-percussion pull (unverified)' },
  { label: 'warm', pattern: /\bwarm(th|er)?\b/gi, note: 'jazz-drift folklore — appears in working prompts across genres', context: 'watch near boom-bap/soul anchors' },
  { label: 'soulful', pattern: /\bsoulful\b/gi, note: 'jazz/gospel-drift folklore (unverified)' },
  { label: 'airy', pattern: /\bairy\b/gi, note: 'jazz-drift folklore (unverified)' },
  { label: 'syrupy', pattern: /\bsyrupy\b/gi, note: 'texture folklore (unverified)' },
  { label: 'hypnotic', pattern: /\bhypnotic\b/gi, note: 'v1 folklore (unverified)' },
  { label: 'waltz / 3-4', pattern: /\bwaltz(es)?\b|\b3\s*\/\s*4\b/gi, note: 'meter pull away from 4/4 — pair with "4/4" stabilizer if intentional' },
  { label: 'chiptune', pattern: /\bchiptunes?\b/gi, note: 'video-game pull', context: 'unless building chiptune' },
  { label: 'glossy', pattern: /\bglossy\b/gi, note: 'over-polish folklore (unverified)' },
  { label: 'radio-ready', pattern: /\bradio[\s-]?ready\b/gi, note: 'community lists this as a WORKING polish term — v1 had it backwards' },
  { label: 'twang', pattern: /\btwangy?\b/gi, note: 'country pull (plausible attractor)' },
  { label: 'uplifting', pattern: /\buplifting\b/gi, note: 'gospel pull (plausible attractor)' },
  { label: 'wah', pattern: /\bwah(-wah)?\b/gi, note: 'funk-guitar pull (owner-observed in session)' },
];

// ---------------------------------------------------------------------------
// ATTRACTORS — the verified genre-gravity mechanism. Each entry: when the
// pattern appears and the build's genre core does NOT match `homeGenres`,
// warn that the word will drag the generation toward `attracts`.
const ATTRACTORS = [
  { label: 'steel guitar', pattern: /\bsteel\s+guitar\b/gi, attracts: 'country', homeGenres: ['country'] },
  { label: 'violin/strings family', pattern: /\bviolins?\b|\bstring\s+(section|ensemble)\b/gi, attracts: 'full orchestral treatment', homeGenres: ['orchestral', 'cinematic', 'soul', 'chipmunk'] },
  { label: 'horn/brass family', pattern: /\bhorns?\b|\bbrass\b|\bsaxophones?\b|\bsax\b|\btrumpets?\b/gi, attracts: 'jazz/funk ensemble', homeGenres: ['jazz', 'funk', 'soul', 'chipmunk', 'bounce'] },
  { label: 'organ', pattern: /\borgans?\b/gi, attracts: 'gospel/church', homeGenres: ['crunk', 'gospel', 'southern', 'soul', 'dirty south'] },
  { label: 'bare "epic"/"cinematic"', pattern: /\bepic\b|\bcinematic\b/gi, attracts: 'generic trailer music', homeGenres: ['trap', 'drill', 'cinematic'], note: 'safe when paired with a concrete subgenre; dangerous alone' },
  { label: 'choir', pattern: /\bchoirs?\b/gi, attracts: 'gospel lift', homeGenres: ['trap', 'gospel', 'cinematic', 'soul'] },
  { label: 'swing/shuffle', pattern: /\bswing\b|\bshuffl(e|es|ing)\b/gi, attracts: 'live-drum feel', homeGenres: ['boom bap', 'jazz', 'soul', 'g-funk', 'bounce'], note: 'groove-critical vocabulary — this is an FYI, not a warning against use' },
  { label: 'anthem', pattern: /\banthem(ic)?\b/gi, attracts: 'stadium/film-score scale', homeGenres: ['anthem', 'stadium'] },
];

// ---------------------------------------------------------------------------
// HARD tier — stripped/substituted. Built-ins are empty by design: only
// server-confirmed dynamic rules (Learning System) and artist names strip.
let DYNAMIC_RULES = [];

export function setDynamicRules(rules = []) {
  DYNAMIC_RULES = [];
  for (const rule of rules) {
    const word = String(rule?.word ?? '').trim();
    if (!word || word.length > 60) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    DYNAMIC_RULES.push({
      label: word,
      pattern: new RegExp(`\\b${escaped}\\b`, 'gi'),
      substitute: rule.substitute ? String(rule.substitute) : undefined,
      dynamic: true,
    });
  }
}

export function getDynamicRules() {
  return DYNAMIC_RULES;
}

// ---------------------------------------------------------------------------

function shieldExemptions(text, shields) {
  return text.replace(/!([a-z0-9'-]+)/gi, (_, word) => {
    shields.push(word);
    return `@@SHIELD@@${shields.length - 1}@@SHIELD@@`;
  });
}

function restoreShields(text, shields) {
  return text.replace(/@@SHIELD@@(\d+)@@SHIELD@@/g, (_, i) => shields[Number(i)]);
}

/**
 * HARD filter: strips/substitutes dynamic (server-confirmed) rules only.
 * Signature kept from v1 — callers throughout the engine use this.
 * Returns { text, hits: [{label, action}] }.
 */
export function filterBannedWords(input) {
  if (!input) return { text: input ?? '', hits: [] };
  let text = String(input);
  const hits = [];
  const shields = [];
  text = shieldExemptions(text, shields);

  for (const rule of DYNAMIC_RULES) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(text)) continue;
    rule.pattern.lastIndex = 0;
    if (rule.substitute) {
      text = text.replace(rule.pattern, rule.substitute);
      hits.push({ label: rule.label, action: 'substituted' });
    } else {
      text = text.replace(rule.pattern, '');
      hits.push({ label: rule.label, action: 'stripped' });
    }
  }

  text = restoreShields(text, shields);
  text = text
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '');
  return { text, hits };
}

/** True if the string contains a HARD-tier violation (dynamic rules). */
export function containsBannedWord(input) {
  if (!input) return false;
  let text = String(input).replace(/!([a-z0-9'-]+)/gi, '');
  return DYNAMIC_RULES.some((rule) => {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(text);
  });
}

/**
 * WATCH analysis: returns warnings for watch-tier words WITHOUT touching the
 * text. Each: { tier: 'watch', label, note, context? }.
 */
export function analyzeWatchWords(input) {
  if (!input) return [];
  const text = String(input).replace(/!([a-z0-9'-]+)/gi, '');
  const warnings = [];
  for (const rule of WATCH_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(text)) {
      warnings.push({ tier: 'watch', label: rule.label, note: rule.note, context: rule.context });
    }
  }
  return warnings;
}

/**
 * ATTRACTOR analysis: genre-gravity warnings, contextual on the build's
 * genre core. Each: { tier: 'attractor', label, attracts, note? }.
 */
export function detectAttractors(input, genreCore = '') {
  if (!input) return [];
  const text = String(input).replace(/!([a-z0-9'-]+)/gi, '');
  const genre = String(genreCore).toLowerCase();
  const warnings = [];
  for (const rule of ATTRACTORS) {
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(text)) continue;
    const atHome = rule.homeGenres.some((g) => genre.includes(g));
    if (!atHome) {
      warnings.push({ tier: 'attractor', label: rule.label, attracts: rule.attracts, note: rule.note });
    }
  }
  return warnings;
}

/** Artist / celebrity name scrub — unchanged product policy, always HARD. */
export function scrubArtistNames(input, names = []) {
  if (!input) return { text: input ?? '', hits: [] };
  let text = String(input);
  const hits = [];
  for (const name of names) {
    if (!name) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (re.test(text)) {
      text = text.replace(re, '');
      hits.push({ label: name, action: 'stripped-artist-name' });
    }
  }
  text = text.replace(/\s{2,}/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '');
  return { text, hits };
}

export const WATCH_LIST = WATCH_RULES;
export const ATTRACTOR_LIST = ATTRACTORS;
