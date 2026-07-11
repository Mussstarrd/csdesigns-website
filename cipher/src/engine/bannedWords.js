/**
 * The permanent kill list — banned trigger words that summon unwanted genres,
 * stock samples, or platform pathologies on Suno v5.5 / Mureka V9.
 *
 * These rules are CODE-ENFORCED. Claude's JSON output is never trusted to be
 * clean: the assembler runs this filter on every descriptor and again on the
 * final assembled string (Stage 3 sweep).
 *
 * Matching is case-insensitive on word boundaries. Entries marked "bare" in
 * the spec (brass, horn, funk, New Orleans…) are banned as standalone tokens
 * AND inside compounds in v1 — the review's stance is that these words leak
 * stock samples regardless of qualifier, so we err on the side of stripping.
 */

// Each entry: { pattern: RegExp, label: string, substitute?: string }
// Order matters: multi-word patterns run before single-word ones so
// "half-time feel" is substituted as a unit before "feel" could be touched.
const RULES = [
  // --- Known traps (multi-word first) ---
  { label: 'half-time feel', pattern: /\bhalf[\s-]?time(\s+feel)?\b/gi, substitute: 'halftime' },
  { label: 'New Orleans', pattern: /\bnew\s+orleans\b/gi, substitute: 'southern bounce lineage' },
  { label: 'jungle drum', pattern: /\bjungle\s+drums?\b/gi },
  { label: 'natural decay', pattern: /\bnatural\s+decay\b/gi, substitute: 'tails cut short' },
  { label: 'round midrange tone', pattern: /\bround\s+midrange\s+tone\b/gi },
  { label: 'rim shot', pattern: /\brim\s?shots?\b/gi },
  { label: 'boss battle', pattern: /\bboss\s+battles?\b/gi },
  { label: 'orchestral pop', pattern: /\borchestral\s+pop\b/gi },
  { label: 'high energy synth', pattern: /\bhigh[\s-]?energy\s+synths?\b/gi, substitute: 'hard-driving synth' },
  { label: 'radio-ready', pattern: /\bradio[\s-]?ready\b/gi },
  { label: 'chart-topping', pattern: /\bchart[\s-]?topping\b/gi },

  // --- Stock-sample summons ---
  { label: 'cowbell', pattern: /\bcowbells?\b/gi },
  { label: 'woodblock', pattern: /\bwood\s?blocks?\b/gi },
  { label: 'reed', pattern: /\breeds?\b/gi },
  { label: 'brass', pattern: /\bbrass\b/gi },
  { label: 'horn', pattern: /\bhorns?\b/gi },
  { label: 'tick', pattern: /\bticks?\b/gi },
  { label: 'click', pattern: /\bclicks?\b/gi },
  { label: 'knock', pattern: /\bknocks?\b/gi, substitute: 'hits with body weight' },
  { label: 'tap', pattern: /\btaps?\b/gi },
  { label: 'stick', pattern: /\bsticks?\b/gi },
  { label: 'block', pattern: /\bblocks?\b/gi },
  { label: 'clave', pattern: /\bclaves?\b/gi },
  { label: 'rim', pattern: /\brims?\b/gi },

  // --- Jazz gravity ---
  { label: 'waltz', pattern: /\bwaltz(es)?\b/gi },
  { label: '3/4', pattern: /\b3\s*\/\s*4\b/g, substitute: 'grouped in threes' },
  { label: 'warm', pattern: /\bwarm(th|er)?\b/gi, substitute: 'velvet on skin' },
  { label: 'syrupy', pattern: /\bsyrupy\b/gi, substitute: 'slow-dripping thick' },
  { label: 'airy', pattern: /\bairy\b/gi, substitute: 'wide open space around it' },
  { label: 'soulful', pattern: /\bsoulful\b/gi, substitute: 'deep-rooted' },
  { label: 'breathes', pattern: /\bbreathes?\b/gi, substitute: 'leaves space between phrases' },
  { label: 'swing', pattern: /\bswings?(ing)?\b/gi, substitute: 'swung' },
  { label: 'shuffling', pattern: /\bshuffl(e|es|ing)\b/gi },
  { label: 'hypnotic', pattern: /\bhypnotic\b/gi, substitute: 'locked in a trance-tight cycle' },
  { label: 'looping', pattern: /\blooping\b/gi, substitute: 'cycled' },

  // --- Video game / anime ---
  { label: 'epic', pattern: /\bepic\b/gi },
  { label: 'chiptune', pattern: /\bchiptunes?\b/gi },

  // --- Over-compressed pop ---
  { label: 'modern', pattern: /\bmodern\b/gi, substitute: 'current-era' },
  { label: 'glossy', pattern: /\bglossy\b/gi },
  { label: 'commercial', pattern: /\bcommercial\b/gi },

  // --- Gospel / country pulls ---
  { label: 'twang', pattern: /\btwangy?\b/gi },
  { label: 'uplifting', pattern: /\buplifting\b/gi },
  { label: 'roots', pattern: /\broots\b/gi },

  // --- Other known traps (single words) ---
  { label: 'funk', pattern: /\bfunky?\b/gi, substitute: 'greasy pocket groove' },
  { label: 'wah', pattern: /\bwah(-wah)?\b/gi },
];

// Words the filter must NEVER touch even though a banned token appears inside
// them ("\b" already protects most cases; this protects hyphen edge cases).
const SAFE_TERMS = [/\bswung\b/gi, /\bhalftime\b/gi, /\bg-funk\b/gi];

// --- Dynamic rules (the Learning System) -----------------------------------
// Confirmed trigger words discovered from aggregated user feedback live in
// the Supabase dynamic_rules table and are injected here at app launch —
// the kill list grows without an app release. Same shape as static RULES.
let DYNAMIC_RULES = [];

/**
 * Install server-confirmed rules. `rules` is [{word, substitute?}].
 * Words are compiled to case-insensitive word-boundary patterns; invalid
 * entries are skipped. Replaces the previous dynamic set (idempotent).
 */
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

/** Static + dynamic, in application order (multi-word statics still first). */
function allRules() {
  return DYNAMIC_RULES.length ? [...RULES, ...DYNAMIC_RULES] : RULES;
}

/**
 * Filter a single string. Returns { text, hits } where hits is a list of
 * { label, action: 'substituted' | 'stripped' } for warning logs.
 * Substitution happens when the kill list has an approved equivalent;
 * otherwise the token is stripped and surrounding whitespace collapsed.
 */
export function filterBannedWords(input) {
  if (!input) return { text: input ?? '', hits: [] };
  let text = String(input);
  const hits = [];

  const shields = [];

  // Exemption prefix (power users editing prompts by hand): "!brass" keeps
  // the word "brass" — the "!" is stripped, the word is shielded from every
  // rule, static and dynamic. One word per "!"; use "!rim !shot" for phrases.
  text = text.replace(/!([a-z0-9'-]+)/gi, (_, word) => {
    shields.push(word);
    return `@@SHIELD@@${shields.length - 1}@@SHIELD@@`;
  });

  // Temporarily shield safe terms so e.g. "swung" survives the "swing" rule.
  SAFE_TERMS.forEach((safe, i) => {
    text = text.replace(safe, (m) => {
      shields.push(m);
      return `@@SHIELD@@${shields.length - 1}@@SHIELD@@`;
    });
  });

  for (const rule of allRules()) {
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

  // Restore shielded safe terms.
  text = text.replace(/@@SHIELD@@(\d+)@@SHIELD@@/g, (_, i) => shields[Number(i)]);

  // Collapse whitespace/punctuation debris left by stripping.
  text = text
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/^[\s,]+|[\s,]+$/g, '');

  return { text, hits };
}

/**
 * Scrub artist / celebrity / producer names from a string using the Artist
 * Decoder name list (plus era labels). Names never appear in output prompts.
 * `names` is an array of artist_name strings from the decoder cache.
 */
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

/** True if the string still contains any banned token (final Stage 3 sweep). */
export function containsBannedWord(input) {
  if (!input) return false;
  let text = String(input);
  // "!"-exempted words don't count as violations.
  text = text.replace(/!([a-z0-9'-]+)/gi, '');
  for (const safe of SAFE_TERMS) {
    safe.lastIndex = 0;
    text = text.replace(safe, '');
  }
  return allRules().some((rule) => {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(text);
  });
}

export const BANNED_RULES = RULES;
