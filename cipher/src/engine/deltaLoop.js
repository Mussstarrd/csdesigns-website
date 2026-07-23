/**
 * Regeneration-delta loop (A2 of docs/V2_SPEC.md) — the killer feature.
 *
 * The most productive real-session workflow is: run the prompt → report what
 * drifted → surgically rebuild targeting that specific failure. This module
 * closes that loop DETERMINISTICALLY: each failure tag maps to a fixed
 * corrective transform on the interpretation object. No LLM call, no
 * latency, no cost — Gemini's architectural objection assumed an LLM
 * rewrite; this is not that.
 *
 * applyDelta(interpretation, feedback, opts) → { interpretation, policy, notes }
 *   policy: { grooveStyle?, density? } — assembler-level corrections
 *   notes:  human-readable list of what was changed and why
 */

import { normalizeExclusion, invertExclusions } from './exclusions.js';

// Common drum-kit nouns → physical event descriptors (stock-kit dodge).
const PHYSICAL_SWAPS = [
  { match: /\bsnare\b/gi, swap: 'cracked hit square on the two and four' },
  { match: /\bhi-hats?\b|\bhats\b/gi, swap: 'thin metallic pulse riding the top end' },
  { match: /\bcymbals?\b/gi, swap: 'washed metal shimmer' },
  { match: /\btoms?\b/gi, swap: 'low round drum thump, deep tucked' },
  { match: /\bxylophones?\b/gi, swap: 'struck metal bar tone, slurred downward in pitch' },
];

const ANTI_MUD = ['tight low-end', 'clear separation between elements'];

function addUnique(list, items) {
  const out = [...(list ?? [])];
  for (const item of items) if (!out.includes(item)) out.push(item);
  return out;
}

/**
 * @param interpretation the interpretation that produced the rated prompt
 * @param feedback { rating, issues: [], unwantedText? }
 * @param opts { suspectTerms?: string[] } — attribution engine output; any
 *        suspect term found inside a descriptor gets that descriptor dropped
 *        (only when a replacement pool remains — never empty a section).
 */
export function applyDelta(interpretation, feedback, opts = {}) {
  const interp = JSON.parse(JSON.stringify(interpretation ?? {}));
  const issues = feedback?.issues ?? [];
  const policy = {};
  const notes = [];

  if (issues.includes('unwanted_element') && feedback.unwantedText) {
    const element = normalizeExclusion(feedback.unwantedText);
    if (element) {
      interp.exclusions = addUnique(interp.exclusions, [element]).slice(0, 5);
      const injections = invertExclusions([element], 1);
      if (injections.length) {
        interp.lead = addUnique(interp.lead, injections);
        notes.push(`Excluded "${element}" and injected a competing element to crowd it out.`);
      } else {
        notes.push(`Excluded "${element}".`);
      }
    }
    // Drop descriptors containing attribution-flagged suspect terms.
    const suspects = (opts.suspectTerms ?? []).map((t) => t.toLowerCase());
    if (suspects.length) {
      for (const field of ['arrangement', 'performance', 'lead', 'room', 'feeling']) {
        const kept = (interp[field] ?? []).filter(
          (d) => !suspects.some((t) => d.toLowerCase().includes(t))
        );
        if (kept.length > 0 && kept.length < (interp[field] ?? []).length) {
          notes.push(`Dropped ${interp[field].length - kept.length} descriptor(s) carrying suspected trigger terms from ${field}.`);
          interp[field] = kept;
        }
      }
    }
  }

  if (issues.includes('genre_drift')) {
    if (interp.genre_core) {
      interp.arrangement = addUnique(
        [`rooted firmly in ${interp.genre_core}`, ...(interp.arrangement ?? [])],
        []
      );
      notes.push('Reinforced the genre anchor at the head of the descriptor stack.');
    }
  }

  if (issues.includes('muddy_mix')) {
    interp.room = addUnique(interp.room, ANTI_MUD);
    notes.push('Injected anti-mud mix language (tight low-end, clear separation).');
  }

  if (issues.includes('unwanted_fills')) {
    policy.grooveStyle = 'displaced';
    notes.push('Switched to displaced groove vocabulary with space assignment — unclaimed rhythmic space gets filled with stock fills, so the prompt now claims it.');
  }

  if (issues.includes('too_generic')) {
    policy.density = 3;
    interp.feeling = (interp.feeling ?? []).slice(0, 1); // broad adjectives die first
    notes.push('Raised descriptor density and trimmed broad mood adjectives.');
  }

  if (issues.includes('vocal_leak')) {
    interp.instrumental = true;
    interp.vocal_direction = null;
    interp.exclusions = addUnique(interp.exclusions, ['vocals']).slice(0, 5);
    notes.push('Forced instrumental handling: early "instrumental, no vocals" + vocals exclusion. Also flip the platform Instrumental toggle.');
  }

  if (issues.includes('structure_ignored')) {
    policy.simplifyStructure = true;
    notes.push('Simplified the structure block — fewer sections parse more reliably.');
  }

  if (issues.includes('stock-kit') || issues.includes('stock_kit')) {
    interp.percussion_physical = (interp.percussion_physical ?? []).map((d) => {
      let out = d;
      for (const { match, swap } of PHYSICAL_SWAPS) {
        match.lastIndex = 0;
        if (match.test(out)) {
          match.lastIndex = 0;
          out = out.replace(match, swap);
        }
      }
      return out;
    });
    notes.push('Replaced drum-kit nouns with physical event descriptors to dodge stock-kit attractors.');
  }

  return { interpretation: interp, policy, notes };
}
