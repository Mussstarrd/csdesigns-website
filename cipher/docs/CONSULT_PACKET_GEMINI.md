# CIPHER v2 — Gemini Consult Packet (round 2)

*You are the second consultant. Below: (A) the original v2 brief with open
questions, (B) the first consultant's (Claude chat) response, which includes
live Suno session failure data. Your job: (1) adjudicate — where do you agree
or disagree with Claude's answers to Q1–Q9, and why; (2) stress-test the two
biggest new proposals: the "positive space assignment" anti-filler mechanism
and the "regeneration-delta loop" (failure report → auto-corrected prompt);
(3) answer Q9 yourself: what's still missing? Be specific and mark which of
your claims are verifiable vs. judgment calls. Do not restate the brief back.*

---

## (A) ORIGINAL BRIEF

CIPHER is a mobile app (React Native/Expo) for rap producers using AI music
generators — Suno (v5.5 current) and Mureka (V9 current). The goal: not just
"rule-compliant prompts" but heaters — prompts engineered around what makes
hip-hop records hit, with first-class support for groove (non-quantized feel,
syncopation, rhythmic displacement), subgenre authenticity (XXXTentacion
distorted emo trap, Dipset/Jadakiss orchestral NY soul, JID displaced flows,
Atlanta organ crunk, Metro cinematic trap), and full use of each platform's
control surfaces (sliders, exclude fields, bracket structure tags, lyric-field
rhythm tricks).

What exists (v1, built & tested): a deterministic ruleset engine with LLM
interpretation — Claude only converts free text to structured JSON tags; all
assembly/validation/counting is local tested code (73 tests). Era-tagged
artist DNA database, three build paths (LLM-interpreted / chip-built
deterministic / two-artist blend), Suno+Mureka dual output, freshness scoring,
exclusion-conflict warnings, and a feedback Learning System: users rate real
generations, tag failures ("saxophone showed up"), a deterministic attribution
engine surfaces suspected trigger words, promotable to a server-synced kill
list without app releases.

Fresh research (July 2026, 4 sourced sweeps) established — confirmed: style
field 1,000 chars but ~100–300 performs best with early tokens weighted;
exclusions are soft guidance, ≤5, leak when the positive prompt implies them;
Suno honors numeric BPM (±2–5); "My Taste" personalization real (v5.5);
Mureka MusiCoT plans structure before audio and obeys bar counts; bracket
section tags probabilistic on both; sliders (Weirdness / Style Influence /
Audio Influence) are real documented controls; hook-first is the rap default
(73–86% of hits), ≤20s to first hook, 2:30–2:50 runtime, beat-switch at ~2/3;
community pro workflow "Suno for the song, Mureka for the stems."
Overturned from v1: much of the banned-word kill list is folklore — worst,
"swing"/"shuffle" were banned but create groove feel; "instrumental as final
style word" unsupported; time-of-day quality degradation unverified (speed
only); "Mureka ignores BPM numbers" unverified.

Planned v2 (pending consults): keep the tested engine + Learning System;
rebuild the knowledge layer — evidence-tiered kill list (verified hard bans;
folklore → watch status adjudicated by user feedback); concision-first
assembler with tempo stabilizers; hit-structure templates with bar counts,
hook-first, optional beat-switch; groove as a first-class descriptor system;
research-sourced subgenre recipe packs; slider-settings output card;
plan-aware tips (free tier = v4.5-all); Suno lyric-field structure sheet;
Mureka V9 pinning, bar-annotated structure blocks, reference-audio/vocal-
gender mutual exclusion.

### Open questions
1. Kill-list epistemology: small verified hard-ban list + large feedback-
   adjudicated watch list — right structure? Soft-handle (warn) or strip?
2. Concision vs coverage: policy for choosing WHICH 8–12 descriptors survive?
3. Groove as its own always-emitted prompt slot — convergence risk?
4. Suno vocal tracks: generate a tagged lyric scaffold (structure only, no
   lyric content)?
5. Slider recommendations: static per-build-type at launch, learned later?
6. Beat-switch: dedicated build path or template variant?
7. Traffic Light (evidence supports queue speed only, not quality): reframe,
   cut, or keep as labeled lore?
8. "half-time feel" (community canon) vs v1's mandated "halftime"?
9. What's missing given the mission?

---

## (B) FIRST CONSULTANT'S RESPONSE (Claude chat — verbatim)

Context: These observations come from a live prompting session (~20 iterative
Suno prompt builds for displaced/syncopated hip hop instrumentals) plus review
of the research findings doc. Important epistemic caveat: none of the
session's prompt fixes are user-verified successes. The reliable data is the
FAILURE reports (what drifted, what Suno injected); the fixes are hypotheses
that survived one round of correction, not confirmed wins. CIPHER's knowledge
layer should only treat explicit user ratings on real generations as
validation.

OBSERVED FAILURE PATTERNS (direct session data):
1. Genre gravity wells are real and strong: "experimental phonk" pulled EDM;
   "anthem" + held strings pulled cinematic battle-drum film score; "funk" was
   flagged by the user as certain to pull wah/horns before running. Attractor
   modeling should be CIPHER's core conflict-map mechanism.
2. Undescribed rhythmic space gets filled: Suno injected tom rolls, clicks,
   and mid-bar fills wherever the prompt left space unaccounted for. Exclusion
   tags alone did not stop this.
3. Named drum elements plus adjectives still pulled stock-sounding kits per
   user reports.
4. Instrument family names carry ensemble gravity ("violin" pulled full
   orchestral treatment).

HYPOTHESES GENERATED (unverified, need play-testing in Learning System):
- Positive space assignment beats exclusion: explicitly assigning mid-bar real
  estate ("between every hit only 808 decay and silence") as the anti-filler
  mechanism.
- Exact grid addresses with stated counts ("one single ghost hit on the
  and-of-3 then nothing," "two ticks only per bar") to constrain
  improvisation.
- Vibe-pairing displacement instructions ("firing a heartbeat before the two,
  sounding wrong on purpose") — addresses alone may read as ignorable
  instruction; feel language alone lacks specificity.
- Physical event descriptors replacing instrument names ("struck metal bar
  tone slurred downward in pitch" vs "xylophone") to dodge attractor pull.

PUSHBACK ON RESEARCH FINDINGS DOC:
1. The 100–300 char optimum is likely build-type-dependent, not global.
   Displacement/anti-grid builds may need 700–1000 chars because every
   percussion element needs an address + feel or space gets filled. Recommend
   per-build-type length budgets with front-loading policy, rather than a
   global concision rule.
2. Jazz-drift demotion to folklore goes too far. "Warm" being safe in some
   genres doesn't falsify context-dependent drift (warm near boom-bap/soul
   anchors vs warm in emo ballad builds). Watch-list entries should be
   word+context PAIRS, not bare words.
3. Swing/shuffle unban: agreed, but tag them as attractors toward live-drum
   feel, which conflicts with some users' aesthetics. Per-user aesthetic
   weighting belongs in the Learning System.

ANSWERS TO OPEN QUESTIONS:
Q1: Small verified hard-ban list + context-conditional watch list,
    soft-handled (warn, don't strip). Silent stripping is how v1 folklore
    calcified.
Q2: Per-build-type budgets. Descriptor survival policy: 1 genre anchor,
    1 mood, remainder spent on instrumentation with physical behavior
    attached. Bare adjectives die first.
Q3: Groove as first-class slot, yes — but with 3+ distinct rhythmic
    vocabularies (behind-beat pocket / displaced anti-grid / forward-leaning
    aggressive) to avoid convergence. Convergence risk is real; session
    prompts began homogenizing.
Q4: Yes, generate the lyric scaffold, and include delivery-cue slots inside
    brackets ([Verse, offset displaced flow]) — session suggests these are
    read.
Q5: Static per-build-type slider recs at launch (rough starting points used
    in session: experimental builds Weirdness 70–80, pocket builds 55–65,
    Style Influence 60–70), learned refinement later.
Q6: Beat-switch as template variant, not dedicated build path. Scope-creep
    risk.
Q7: Cut Traffic Light entirely.
Q8: Follow community canon "half-time feel." No evidence supports the v1
    "halftime" rule; matching community phrasing the model likely saw in
    training is the point.
Q9: MISSING CAPABILITY — regeneration-delta loop. The most productive session
    pattern was: run → user reports drift → surgical rebuild targeting the
    specific failure. CIPHER captures failure tags but the brief doesn't
    close the loop by auto-generating a corrected prompt from the failure
    report. The attribution engine output should feed back into the
    assembler. This is arguably the killer feature.
