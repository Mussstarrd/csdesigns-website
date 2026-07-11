/**
 * Describe It — client for the `interpret` Edge Function.
 * The LLM produces Stage-1 JSON only; the local engine does the rest.
 */
import { supabase } from './supabaseClient.js';
import { getDeviceId } from './deviceId.js';
import { validateInterpretation } from '../engine/interpretationSchema.js';

export class DailyLimitError extends Error {
  constructor(limit) {
    super(`Daily free limit of ${limit} AI generations reached`);
    this.name = 'DailyLimitError';
    this.limit = limit;
  }
}

/**
 * Interpret free text (plus optional decoder context) into an interpretation
 * object. Returns { interpretation, cached, remaining }.
 */
export async function interpretDescription(input, context = '') {
  if (!supabase) throw new Error('Describe It needs a connection — Build It works offline.');
  const deviceId = await getDeviceId();

  const { data, error } = await supabase.functions.invoke('interpret', {
    body: { input, context, deviceId },
  });

  if (error) {
    // supabase-js surfaces non-2xx as FunctionsHttpError with a Response.
    const status = error.context?.status;
    if (status === 429) throw new DailyLimitError(10);
    throw new Error('The interpreter is unreachable. Try again, or use Build It — it works offline.');
  }
  if (data?.error === 'daily_limit_reached') throw new DailyLimitError(data.limit ?? 10);
  if (!data?.interpretation) throw new Error('Interpreter returned nothing usable.');

  // NEVER trust the LLM: validate + coerce before it touches the assembler.
  const { interpretation } = validateInterpretation(data.interpretation);
  return {
    interpretation,
    cached: data.cached === true,
    remaining: data.remaining ?? null,
  };
}

/**
 * Short-input interception (adversarial review): inputs under 4 words or
 * containing a decoder artist name get expanded via the Artist Decoder and
 * confirmed with the user before any LLM call.
 */
export function needsInterception(input, matchedArtist) {
  const words = String(input ?? '').trim().split(/\s+/).filter(Boolean);
  return words.length < 4 || matchedArtist != null;
}
