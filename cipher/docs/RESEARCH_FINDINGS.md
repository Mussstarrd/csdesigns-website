# CIPHER v2 Research Findings — Suno & Mureka Best Practices (July 2026)

Four parallel research sweeps: Suno platform/controls, Mureka platform/controls,
groove & trigger-word vocabulary, subgenre recipes & hit structure. Claims are
tagged [OFFICIAL], [COMMUNITY] (multiple independent guides agree), or
[FOLKLORE] (unverified). Full source URLs preserved inline.

---

## 1. Platform ground truth

### Suno (current: v5.5, released Mar 26 2026)
- Model line: v4 → v4.5 (style field 200→**1,000 chars**, lyrics 5,000) → v4.5+ →
  v5 → **v5.5** (Voices voice-cloning, Custom Models, **My Taste** personalization
  that learns your recurring styles — all [OFFICIAL]).
- **Free tier runs v4.5-all, NOT v5.5.** Advice must be plan-aware.
- Truncation past the char cap is silent [COMMUNITY].
- **Optimal style length is ~100–300 chars, not the max.** Early tokens weigh
  more: genre first, then mood, instrumentation, vocal character, tempo
  [COMMUNITY]. → Our assembler currently over-stuffs; needs a concision policy.
- **Sliders** [OFFICIAL: help.suno.com]: Weirdness (randomness; lower = stable
  hooks), Style Influence (adherence to style text; higher = literal), Audio
  Influence (uploads only). Not quality knobs. Community default 50/50, nudge
  one at a time.
- **Exclude Styles**: soft guidance, not a ban; leaks when the positive prompt
  implies the excluded thing (our conflict-map thesis confirmed); ≤5 items;
  pair every exclusion with a positive replacement [COMMUNITY].
- **BPM in the style prompt IS honored** (±2–5 BPM, Tier-1 reliability per a
  400-generation community study). Stabilizers: "constant tempo, steady groove,
  no tempo changes, 4/4" [COMMUNITY].
- **Instrumental**: the toggle is the real control; "instrumental, no vocals"
  belongs EARLY in the style text. Our "instrumental as final word" rule is
  [FOLKLORE] — no source supports last-position.
- **Peak-hour quality degradation is [FOLKLORE].** Only generation SPEED is
  documented to vary with load. → Traffic Light feature must be reframed or cut.

### Mureka (current: V9, ~Mar 2026; V8/O2/V7.6 behind it)
- **MusiCoT confirmed and peer-reviewed** (arXiv 2503.19611): the model plans
  structure (sections, arrangement, emotion) BEFORE generating audio. → Our
  always-emit-a-structure-block decision is strongly validated.
- Mureka **obeys bar counts** ("8-bar intro / 16-bar verse") [COMMUNITY] →
  templates should carry explicit bar numbers.
- Prompting: comma-separated production descriptors; vocal descriptors go in
  the style prompt; lyrics ≤5,000 chars; ~240s max duration.
- **Our "Mureka ignores numeric BPM" rule is [FOLKLORE]** — unverified either
  way; feel words remain the safe primary lever, but numeric BPM (70–140
  claimed) may work. Ship both.
- **Reference-audio precedence trap** [OFFICIAL FAQ]: reference audio + vocal
  gender setting → audio wins, gender silently ignored. App must make these
  mutually exclusive.
- Differentiators: **12-stem + per-instrument MIDI export**, voice cloning,
  real API. Retired models silently alias to V7.6 — pin versions.
- Community verdict for rap: **"Suno for the song, Mureka for the stems."**
  Mureka wins flow/phrasing/structure obedience; Suno wins vocal emotion and
  mix polish. Dual output = the actual pro workflow.
- Unverified but cheap to adopt: instrument-role ordering "Lead: X, Harmony: Y,
  Rhythm: Z" with lead weighted most [FOLKLORE].

---

## 2. Groove & rhythm vocabulary (the user's core ask)

**Terms that WORK** [COMMUNITY, multi-source]:
- "pocket groove" + "behind the beat" — called "the single biggest dial Suno
  responds to" for feel.
- "swing rhythm", "hi-hat swing", "shuffle" — without an explicit swing cue,
  Suno defaults to rock-straight grids.
- "140 BPM, half-time feel" — the canonical trap formula: full BPM number PLUS
  the half-time flag. **Community uses the hyphenated "half-time" freely; our
  ban of it (spec-mandated "halftime" one word) is contradicted by the
  evidence — DECISION NEEDED.**
- Dilla feel as a bundle: "off-grid drum swing, dusty samples, laid-back
  groove" (the phrase "drunk drums" alone: [FOLKLORE]).
- "[Syncopated]" reshapes rhythm already described; it does not create rhythm
  from nothing — define the pattern first.
- Natural-language drummer descriptions ("accents the 2 and 4", "leaves space
  on the and-of-3") [single-source, promising].
- Dense lyric lines force double-time delivery; sparse lines slow the flow —
  the LYRICS FIELD is itself a rhythm control.

**Placebo warning** [COMMUNITY-tested]: numeric parameter tags ("reverb 30%")
do nothing. Descriptors must map to real production vocabulary.

---

## 3. Trigger words — kill-list audit

- **Confirmed mechanism: genre-defining instruments are attractors.** Steel
  guitar→country, 808→hip-hop, distorted guitar→rock. Mentioning them pulls
  the whole genre [COMMUNITY].
- "epic"/"cinematic" alone → generic trailer music [COMMUNITY] — our ban of
  bare "epic" survives (better: require pairing with a subgenre).
- Cowbell association runs through phonk/Memphis/drift vocabulary — NOT through
  neutral percussion words. Our tick/click/knock/tap/stick/block/rim bans:
  [FOLKLORE], no primary sources found.
- "warm/soulful/airy → jazz drift": [FOLKLORE]. "warm" appears in working
  prompts across genres. Our jazz-gravity list is largely unverified.
- **"swing"/"shuffle" are banned in our list but are the very words that CREATE
  groove per the research. Active harm — must be unbanned.**
- Vague mood words ("beautiful, amazing") aren't dangerous, just useless.
- Default gravity is toward MODERN TRAP production; vintage sounds need
  explicit anchors ("90s hip-hop, dusty samples, vinyl crackle") or Suno
  modernizes them [COMMUNITY].
- Verdict: shrink the hard kill list to verified entries; demote folklore
  entries to "watch" status adjudicated by the Learning System (which was
  built for exactly this).

---

## 4. Mix-quality language [COMMUNITY]
- Anti-mud: "clear mix, separated instruments, tight low-end, clean low end,
  clear separation between elements."
- Drums: pattern name + placement ("boom bap drums, punchy, forward in mix").
- Polish tier: "polished mix, wide stereo, professional mastering."
  Character tier: "vinyl crackle, tape warmth, analog recording."
- Over-compression: artifact of low-mid mud, not any trigger word — fix mud.

---

## 5. Structure & meta tags
- Reliable core (v4.5–v5.5): [Intro] [Verse]/[Verse 1] [Pre-Chorus] [Chorus]
  [Bridge] [Break] [Outro] [Instrumental] [Build] [Drop].
  **"[Beat drop]" is non-standard and gets ignored — use [Drop].** (Our Mureka
  templates don't use it; Suno lyric templates must not either.)
- Tags on their own line, 1–3 words, probabilistic; fantasy tags are placebo.
- **Parentheses are ALWAYS sung as backing vocals** — "(whispered)" gets sung
  as the word "whispered". Performance directions go in brackets: [whispered]
  [belted] [spoken word].
- Structure tags never go in the Style field.

---

## 6. Subgenre recipes (verbatim-sourced community formulas)

1. **Distorted lo-fi emo trap (X-adjacent)**: "emo trap, lo-fi, distorted 808,
   raw vocals, sad guitar loop, layered vocals, South Florida, depressing
   atmosphere" · 75–95 BPM · minor. Distinguish "heavy 808" (sustained sub)
   from "distorted 808" (clipped grit).
2. **Early-2000s NY / Dipset chipmunk soul**: "chipmunk soul, pitched-up soul
   sample, dramatic strings, orchestral hits, bold brass hits, boom bap drums,
   early 2000s East Coast hip hop, vinyl crackle" · ~88–100 BPM. Naming the
   sample-source type ("soul loop", "piano chop") reliably steers the aesthetic.
3. **JID-style displaced technical rap**: encode via delivery + feel ("varied
   flow, tempo shifts, complex rhyme patterns, jazz-rap fusion, live drums,
   syncopated, off-kilter drums") + dense lyric packing for machine-gun
   sections + [Beat Switch]→new-style-line for pocket changes (probabilistic).
   Data point: JID's Forever Story = a flow switch every ~14 seconds.
4. **Atlanta crunk / organ southern rap**: "crunk, dirty south, pounding 808s,
   organ slides / church organ, brass stabs, aggressive shouted vocals,
   call-and-response chants" · half-time ~75–85 effective BPM. Thinnest
   community coverage of the five — needs play-testing (Learning System).
5. **Metro-style cinematic dark trap**: "dark atmospheric trap, reversed bell
   loop, haunting choir, 808 sub with long decay and pitch slide, hi-hat
   triplets and rolls, sparse arrangement, deliberate empty space, menacing,
   140 BPM half-time feel."

---

## 7. Hit-record structure (encodable)

- **Hook-first is the rap default**: 73–86% of charting rap hits put the chorus
  before the first verse [Hit Songs Deconstructed].
- Time-to-first-hook target: **≤20 seconds**.
- Track length sweet spot: **2:30–2:50** (under 2:00 loses hook count, over
  3:00 raises skip rate).
- Bar math: verse 16 (streaming-era trim: 8–12), hook 4–8, hook appears ≥3×,
  final hook often doubled.
- Energy: front-loaded; texture changes over dynamic builds; **beat-switch at
  ~2/3 of the track** as the late novelty spike (Kendrick/JID/Travis/Metro
  device, now a streaming retention tool).
- Community-standard template:
  `[Intro 2-4 bars] → [Hook ≤20s] → [Verse 1, 12-16 bars] → [Hook] →
  [Verse 2, 8-16] → [Bridge or Beat Switch + new style line] →
  [Hook, doubled] → [Outro/End]`

---

## 8. What this means for the existing build

**Validated**: deterministic-engine architecture; 1,000-char limit; ≤5
exclusions; exclusion-conflict map thesis; structure blocks (hard-validated by
MusiCoT); My Taste/Freshness Guard; genre-gravity concept; comma-descriptor
Mureka format; era-anchoring ("Suno modernizes without vintage anchors" is
literally our decoder's job).

**Contradicted / must change**:
1. Kill list: unban swing/shuffle (groove-critical), demote most stock-sample
   and jazz-gravity entries to Learning-System "watch" status; keep bare
   "epic" handling.
2. "half-time" ban vs community canon — owner decision needed (spec said
   "halftime"; evidence says "half-time feel" is standard usage).
3. Assembler policy: target ~150–300 char front-loaded prompts, not stacked
   descriptors toward the ceiling; add tempo stabilizers ("constant tempo,
   4/4") when groove words are present.
4. Instrumental: early placement + toggle guidance, drop the final-word rule.
5. Traffic Light: reframe as speed/queue advisory or cut.
6. Structure templates: rebuild on hit-structure data (hook-first, bar counts,
   beat-switch template, 2:30–2:50 target).
7. New outputs: slider-settings card (Weirdness/Style Influence per build
   type), plan-aware tips (free tier = v4.5-all), Suno lyric-field structure
   sheet for vocal tracks, exclusion+replacement pairing.
8. Mureka: pin model V9, mutual-exclusion for reference-audio vs vocal-gender,
   optional "Lead/Harmony/Rhythm:" role ordering experiment.
