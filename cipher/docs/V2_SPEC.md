# CIPHER v2 — Reconciled Build Spec

Synthesis of: 4-sweep platform research (RESEARCH_FINDINGS.md), Claude chat
consult (live-session failure data), Gemini consult (adjudication + stress
tests). Architecture unchanged: deterministic engine + LLM interpretation +
Learning System. This spec rebuilds the KNOWLEDGE layer and closes the
feedback loop.

## Decisions locked (multi-consult consensus)

| # | Decision |
|---|---|
| D1 | Kill list → evidence tiers. Small verified HARD list; everything else WATCH status: **warn, never silently strip** (silent stripping is how v1 folklore calcified). Unban swing/shuffle/half-time/warm/soulful and the unverified stock-sample words. |
| D2 | "half-time feel" replaces mandated "halftime" — match community canon the models trained on. |
| D3 | Per-build-type character budgets, not a global concision rule. Front-loading order is global. |
| D4 | Groove is a first-class prompt slot with **3 distinct vocabularies** (behind-beat pocket / displaced anti-grid / forward-leaning aggressive) to prevent convergence. |
| D5 | Suno vocal builds get a structure-only lyric scaffold with delivery cues in brackets ("[Verse 1 — offset displaced flow]"). No lyric content. |
| D6 | Slider recommendation card, static per build type at launch, explicitly labeled "starting points" (session-derived, unverified tier). Learned refinement later. |
| D7 | Beat-switch = template variant, not a build path. |
| D8 | Descriptor survival: 1 genre anchor + **≤2 broad mood adjectives** (Gemini is right that they're load-bearing attractors — capped, not killed) + instrumentation with physical behavior attached + groove slot. Filler adjectives beyond the cap die first. |

## Adjudications (where consultants disagreed)

**A1 — Positive space assignment** (Claude proposes; Gemini stress-tests as
high-risk token waste). Ruling: *both positions are unverified hypotheses;
this is exactly what the Learning System adjudicates.* Ship it **scoped**:
space-assignment language is emitted ONLY in displacement/anti-grid builds
(where the failure data came from), never in standard builds, and it is one
of the delta-loop's corrective transforms for the "unwanted fills" failure
tag. Ratings decide whether it survives.

**A2 — Regeneration-delta loop** (Claude: killer feature; Gemini: breaks the
deterministic architecture, needs an LLM). Ruling: *Gemini's objection
attacks an implementation we're not building.* The loop is *deterministic*:
each failure tag maps to a fixed corrective transform on the interpretation
JSON + assembler policy — no LLM call, no latency, no cost:
- `unwanted_element("saxophone")` → add exclusion + **inversion injection**
  (see A3) + strip suspected attractor terms flagged by attribution
- `genre_drift` → strengthen era/genre anchors to front, add vintage anchors
- `muddy_mix` → inject anti-mud language ("tight low-end, clear separation")
- `stock-kit sound` → swap instrument names for physical event descriptors
- `unwanted fills` (new tag) → space-assignment language (displacement vocab)
- `too_generic` → raise descriptor density, drop broad adjectives
An LLM-assisted "smart fix" can be a labeled premium option later; the core
loop stays local.

**A3 — Exclusion inversion** (Gemini's addition; converges with research's
"pair every exclusion with a positive replacement" and Claude's space
assignment). ADOPT: deterministic replacement table — every exclusion injects
a competing positive descriptor into the style field (exclude "saxophone" →
inject a dominant competing lead, e.g. "hard synth lead front and center").

**A4 — Traffic Light** (Claude: cut; Gemini: reframe as queue-speed
indicator). OWNER DECISION — both defensible. Note: the Vault's
save-now-copy-later flow survives either way.

**A5 — Structure translation layer** (Gemini's addition). ADOPT and make
explicit: ONE canonical structure template (bar-annotated, hook-first,
first hook ≤20s, 2:30–2:50 target, optional beat-switch at ~2/3) rendered
two ways: (a) Suno lyric-field bracket scaffold with delivery cues,
(b) Mureka bar-annotated structure block. Half of this exists; the Suno
renderer and the canonical intermediate form are new.

## Workstreams

1. **Ruleset v2** (`engine/ruleTiers.js` replacing kill-list behavior):
   hard tier (verified only), watch tier (warn + record context, no strip),
   attractor conflict map (instrument→genre gravity: steel guitar→country,
   808→hip-hop, violin→orchestral, "epic" alone→trailer), context recording
   for future word+context pairs. Migrate `!` exemptions + dynamic rules.
2. **Assembler policy v2**: per-build budgets (pocket ~250–350 · standard
   ~400–600 · displacement ~700–990 chars), global front-load order, tempo
   stabilizers ("constant tempo, steady groove, 4/4") auto-added when groove
   words present, "instrumental, no vocals" EARLY + toggle guidance,
   drop instrumental-last rule.
3. **Groove system** (`engine/groove.js`): three vocabularies, BPM+feel
   pairing ("140 BPM, half-time feel"), Dilla bundles, natural-language
   drummer phrases, space-assignment vocab (displacement only).
4. **Structure translation layer** (`engine/structureCanon.js` + renderers):
   canonical templates w/ bar counts from hit-structure data; Suno scaffold
   renderer; Mureka block renderer (bar-annotated).
5. **Delta loop** (`engine/deltaLoop.js` + Output UI): failure tag →
   transform map → one-tap "FIX & REBUILD" on a rated generation; new
   feedback tag `unwanted_fills`; attribution suspects feed transform
   targeting.
6. **Exclusion inversion table** in exclusions.js.
7. **Recipe packs**: 5 researched subgenre presets as first-class Build It
   chips; seed DNA updated with groove-slot fields + de-folklored language.
8. **Output cards**: slider recs per build type, plan-aware tips (free tier
   = v4.5-all), Mureka quirk warnings (reference-audio precedence, V9 pin).
9. **Tests**: every changed rule gets its test updated/added; ruleset tier
   behavior, budgets, translation renderers, delta transforms all covered.

## Explicitly cut / changed from v1
- Silent banned-word stripping (→ warn-only watch tier; hard tier still strips)
- "halftime" mandate, instrumental-last rule
- Global concision assumption
- Traffic Light: pending owner (A4)
