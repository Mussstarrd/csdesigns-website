/**
 * Stage 1 contract — the structured JSON Claude must return.
 *
 * The LLM is never trusted: this module validates and coerces whatever comes
 * back into a safe, fully-typed interpretation object. Anything malformed is
 * dropped or defaulted, never passed through raw.
 */

const STRING_ARRAY_FIELDS = [
  'arrangement',
  'performance',
  'percussion_physical',
  'low_end',
  'lead',
  'room',
  'feeling',
  'exclusions',
];

export function emptyInterpretation() {
  return {
    genre_core: '',
    bpm: null,
    bpm_feel: '',
    key: '',
    key_emotion: '',
    arrangement: [],
    performance: [],
    percussion_physical: [],
    low_end: [],
    lead: [],
    room: [],
    feeling: [],
    exclusions: [],
    instrumental: true,
    vocal_direction: null,
  };
}

function cleanString(v, maxLen = 200) {
  if (typeof v !== 'string') return '';
  return v.trim().replace(/\s{2,}/g, ' ').slice(0, maxLen);
}

function cleanStringArray(v, maxItems = 12) {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => cleanString(item))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Validate + coerce a raw object (parsed from Claude's response or built by
 * the deterministic chip path) into a safe interpretation.
 * Returns { interpretation, problems } — problems lists coercions applied,
 * useful for logging; never throws on bad shapes.
 */
export function validateInterpretation(raw) {
  const problems = [];
  const out = emptyInterpretation();
  if (!raw || typeof raw !== 'object') {
    problems.push('interpretation was not an object; using empty defaults');
    return { interpretation: out, problems };
  }

  out.genre_core = cleanString(raw.genre_core);
  if (!out.genre_core) problems.push('missing genre_core');

  const bpm = Number(raw.bpm);
  if (Number.isFinite(bpm) && bpm >= 40 && bpm <= 220) out.bpm = Math.round(bpm);
  else if (raw.bpm != null) problems.push(`bpm out of range: ${raw.bpm}`);

  out.bpm_feel = cleanString(raw.bpm_feel, 60);
  out.key = cleanString(raw.key, 30);
  out.key_emotion = cleanString(raw.key_emotion, 60);

  for (const field of STRING_ARRAY_FIELDS) {
    out[field] = cleanStringArray(raw[field]);
  }

  out.instrumental = raw.instrumental !== false; // default true
  out.vocal_direction = out.instrumental ? null : cleanString(raw.vocal_direction, 400) || null;

  return { interpretation: out, problems };
}

/**
 * Attempt to parse Claude's raw text response into an interpretation.
 * Tolerates markdown fences and leading/trailing prose around the JSON.
 */
export function parseInterpretationResponse(text) {
  const problems = [];
  let raw = null;
  const source = String(text ?? '');
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : source;
  try {
    raw = JSON.parse(candidate);
  } catch {
    // Last resort: first {...} block in the text.
    const brace = candidate.match(/\{[\s\S]*\}/);
    if (brace) {
      try {
        raw = JSON.parse(brace[0]);
      } catch {
        problems.push('could not parse JSON from LLM response');
      }
    } else {
      problems.push('no JSON object found in LLM response');
    }
  }
  const result = validateInterpretation(raw);
  result.problems = [...problems, ...result.problems];
  return result;
}
