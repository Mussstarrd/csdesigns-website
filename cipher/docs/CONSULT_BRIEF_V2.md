# CIPHER v2 — Consult Brief (for Claude chat & Gemini)

*Paste this whole document. You are being consulted before an engineering
round. Respond to the numbered OPEN QUESTIONS at the end; critique anything
else you see, but distinguish "this is wrong" from "this is a taste call."*

## The mission

CIPHER is a mobile app (React Native/Expo) for rap producers using AI music
generators — Suno (v5.5 current) and Mureka (V9 current). The owner's goal has
sharpened: not just "rule-compliant prompts" but **heaters** — prompts
engineered around what actually makes hip-hop records hit, with first-class
support for groove (non-quantized feel, syncopation, rhythmic displacement),
subgenre authenticity (XXXTentacion distorted emo trap, Dipset/Jadakiss
orchestral NY soul, JID displaced flows, Atlanta organ crunk, Metro cinematic
trap), and full use of each platform's control surfaces (sliders, exclude
fields, bracket structure tags, lyric-field rhythm tricks).

## What exists today (v1, built & tested)

A deterministic ruleset engine with LLM interpretation — Claude only converts
free text to structured JSON tags; all assembly/validation/counting is local
tested code (73 tests). Era-tagged artist DNA database (25 seeded), three
build paths (LLM-interpreted / chip-built deterministic / two-artist blend),
Suno+Mureka dual output, freshness scoring vs your own recent prompts,
exclusion-conflict warnings, and a feedback Learning System where users rate
real generations, tag failures ("saxophone showed up"), and a deterministic
attribution engine surfaces suspected trigger words, promotable to a
server-synced kill list without app releases.

## What fresh research (July 2026, 4 parallel sourced sweeps) established

**Confirmed**: style field 1,000 chars (but ~100–300 performs best; early
tokens weigh more); exclusions are soft guidance, ≤5, and leak when the
positive prompt implies them; Suno honors numeric BPM (±2–5); "My Taste"
personalization is real (v5.5); Mureka's MusiCoT plans structure before audio
and obeys bar counts; bracket section tags work probabilistically on both;
sliders (Weirdness/Style Influence/Audio Influence) are real documented
controls; hook-first is the rap default (73–86% of hits), ≤20s to first hook,
2:30–2:50 runtime, beat-switch at ~2/3 as retention device; community pro
workflow is "Suno for the song, Mureka for the stems."

**Overturned from v1's ruleset**: much of the banned-word kill list is
folklore — worst, "swing"/"shuffle" were banned but are the very words that
create groove feel; "instrumental as final style word" unsupported (toggle +
early placement is real); time-of-day quality degradation unverified (speed
only); "Mureka ignores BPM numbers" unverified. The kill list must shrink to
verified entries with folklore demoted to Learning-System "watch" status.

**Groove vocabulary that works** (community-consensus): "pocket groove" +
"behind the beat"; "swing rhythm/hi-hat swing/shuffle"; "140 BPM, half-time
feel" (number + feel together); Dilla bundles ("off-grid drum swing, dusty
samples, laid-back groove"); syncopation words reshape rhythm only if the
rhythm is described first; dense vs sparse lyric lines control flow speed;
stabilizers "constant tempo, steady groove, 4/4" prevent drift; numeric FX
tags ("reverb 30%") are placebo.

## The plan (pending this consult)

Keep the tested deterministic engine and Learning System; **rebuild the
knowledge layer**: (1) evidence-tiered kill list (hard bans only where
verified; folklore → watch status that user feedback adjudicates); (2)
concision-first assembler (~150–300 char front-loaded prompts, tempo
stabilizers auto-added with groove words); (3) hit-structure templates with
bar counts, hook-first ordering, optional beat-switch, 2:30–2:50 targeting;
(4) groove descriptor system as a first-class prompt section; (5) research-
sourced subgenre recipe packs (the five above) as curated presets; (6) new
output cards: slider settings per build, Suno lyric-field structure sheet
(vocal tracks), plan-aware tips (free tier = v4.5-all, not v5.5); (7) Mureka:
pin V9, bar-annotated structure blocks, reference-audio/vocal-gender mutual
exclusion.

## OPEN QUESTIONS — respond to these specifically

1. **Kill-list epistemology.** With most trigger-word folklore unverifiable,
   is "small verified hard-ban list + large watch list adjudicated by user
   feedback" the right structure? Or should watch-listed words get soft
   handling (warn but don't strip) in the prompt itself?
2. **Concision vs coverage.** Research says ~100–300 chars beats maxed-out
   prompts, but our subgenre recipes carry rich descriptor sets. What's the
   right policy for choosing WHICH 8–12 descriptors survive into the final
   prompt (front-loading order, per-category caps, energy-based density)?
3. **Groove section design.** Should groove be its own prompt slot (always
   emitted: BPM + feel + stabilizers + pocket words) rather than descriptors
   scattered across categories? Any risk of over-constraining every build
   toward the same rhythmic language?
4. **Structure output for vocal tracks.** For Suno, structure lives in the
   LYRICS field. Should CIPHER generate a complete tagged lyric scaffold
   ([Intro]/[Hook]/[Verse 1, 12-16 bars]/[Beat Switch]...) with placeholder
   bars the user fills in — without writing lyric content (out of scope)?
5. **Slider recommendations.** Static per-build-type recommendations
   (e.g. stable hook → Weirdness 30%, Style Influence 70%) or learned from
   the feedback loop over time? What's defensible at launch?
6. **Beat-switch encoding.** Worth a dedicated "beat-switch build" that
   outputs two style descriptions + a switch point, given tag compliance is
   probabilistic? Or scope-creep for v2?
7. **Traffic Light.** Evidence supports queue-speed differences only, not
   quality. Reframe as "generation speed" indicator, cut entirely, or keep as
   clearly-labeled lore?
8. **"half-time" vs "halftime".** v1 spec mandated the single word "halftime"
   as a hard rule; the research shows the community canonically writes
   "half-time feel" in working prompts. Any reason to keep the v1 rule?
9. **What are we missing?** Given the mission (heaters, groove, subgenre
   authenticity, full control-surface use), what capability or failure mode is
   absent from the plan above?
