# CIPHER — Project Status & Design Review Brief

*Prepared for external review (Gemini). Everything described here is built,
committed, and pushed to branch `claude/cipher-mobile-app-6rz25z` in the
`cipher/` directory. Reviewer: you are the last input before this goes back
to the engineering loop — critique freely, but note what is a v1 decision
vs. a bug.*

## What CIPHER is

A React Native (Expo) mobile app for rap/beat producers that generates
rule-compliant prompts for AI music platforms — **Suno v5.5** and **Mureka
V9** — simultaneously. Its core thesis: effective prompts on these platforms
require dozens of undocumented rules (trigger words that summon stock
samples or wrong genres, character limits, descriptor-recycling penalties,
platform formatting quirks), and users waste credits because they don't know
them.

**Architecture principle (from a prior adversarial review):** CIPHER is a
*deterministic ruleset engine with LLM interpretation*, not an LLM wrapper.
Claude (via a Supabase Edge Function; key never ships in the app) is used
ONLY to translate free text into structured JSON tags. All string assembly,
character counting, banned-word filtering, exclusion formatting, and
validation is deterministic local code with unit tests.

## Current state — all built and passing

- **Engine** (pure JS, 67 unit tests, `npm test`, no device needed):
  - Locked Suno "Prompt Stack" assembly order: [BPM+feel] [key+emotion]
    [genre] → arrangement → performance → percussion/low-end/lead → room →
    feeling → `instrumental` tag last.
  - 990-char hard ceiling (10 under Suno's 1,000); truncation drops trailing
    *feeling* descriptors first, never the front-loaded BPM/key/genre.
  - Static banned-word kill list (~50 rules) with an approved substitution
    map ("3/4"→"grouped in threes", "half-time feel"→"halftime",
    "warm"→"velvet on skin"), with shielding so approved terms ("halftime",
    "swung", "g-funk") survive. Final sweep on the assembled string.
  - Exclusions: `no [element]`, hard cap 5, always a separate Exclude field;
    static conflict map warns when an exclusion sits near a positive tag in
    latent space (e.g. positive "trap" + exclude "808") with
    [Remove]/[Keep anyway] UI.
  - Mureka formatter: same content, BPM converted to feel words only
    ("sluggish halftime pace", never numbers), Vocal Direction field, and a
    Structure Block always emitted (MusiCoT plans arrangement from structure
    tags) — 10 genre/energy templates with the track's element names
    injected.
  - Artist-name scrubbing (regex + decoder dictionary) — names never appear
    in output prompts.
- **Artist Decoder**: Supabase `artist_dna` table, era-tagged (one row per
  era). 25 fully-written seed entries (hip-hop/trap/boom bap weighted), each
  with distinct physical-sensation DNA — enforced by tests (no descriptor
  reuse across artists, banned-word-clean, assembles clean on both
  platforms). App fetches + caches 24h, works offline from bundled data.
  Target ~150 entries (owner content work).
- **Three input paths**:
  - *Describe It* (free text → Claude JSON): short-input interception (<4
    words or artist name → decoder-expanded confirmation card), server-side
    response cache keyed by normalized-input hash (identical inputs across
    all users cost one API call), 10/day free tier enforced server-side
    (atomic SQL counter) + client-side, paywall stub (no payments in v1).
  - *Build It* (chips: artist-era / region-era / vibe / production style +
    fine-tune overrides): fully deterministic, no LLM, unlimited, <10ms.
  - *Blend It*: Foundation+Texture constraint hierarchy, NOT percentage
    blending. Foundation contributes BPM/percussion/low-end/exclusions and
    its avoid-list wins outright; Texture contributes lead/room/feeling;
    flavor slider (60/40–90/10) only scales how many Texture descriptors
    survive, never structure.
- **Output screen**: SUNO/MUREKA tabs, live color-coded char counter
  (green <900 / yellow 900–970 / red >970), in-place editing with live
  re-validation, one-tap copy per field, Traffic Light server-load indicator
  (client-side CET heuristic: red 12:00–23:00, green 02:00–07:00, component
  designed to swap in a real server-load API), REGENERATE (local descriptor
  re-roll) and SAVE TO VAULT.
- **Freshness Score**: semantic, not string matching. Embedding of the
  assembled prompt (Voyage via Edge Function; vector cached in the Vault
  entry); freshness = 100 − max cosine similarity vs last N Vault entries
  (default 10). Green 80–100 / yellow 50–79 / red <50. "My Taste Protection"
  (default ON) warns at yellow because Suno's My Taste feature permanently
  learns repeated descriptors. Offline fallback: Jaccard, labeled
  "approximate".
- **Vault**: session grouping — regenerations of the same input stack as
  versions on one card (v1..vN), star the winner, search/filter/sort,
  copy/edit/delete.
- **Settings**: style profile auto-learned after 10 prompts (median BPM,
  modal key/region → Build It smart defaults), freshness window, My Taste
  toggle, timezone display, decoder browser + suggest-an-artist form, usage
  meter.
- **Learning System (newest addition)**: after running a prompt on the real
  platform, the user rates the generation (🔥/😐/🗑) and tags failures
  (unwanted element appeared / genre drift / muddy mix / ignored exclusion /
  vocal leak / structure ignored / too generic), optionally naming the
  uninvited element. A deterministic attribution engine
  (unigrams+bigrams, Laplace-smoothed bad-ratio, "summons" weighting when a
  term co-occurs with a named unwanted element) surfaces suspected trigger
  words locally (Settings → Trigger Lab). Feedback syncs to Supabase where a
  `trigger_suspects` view aggregates evidence across all users; the owner
  promotes confirmed suspects into a `dynamic_rules` table that every device
  fetches on launch — the kill list grows without app releases. Dynamic
  rules run after static substitutions so chains can't reintroduce a newly
  banned word.

## Known v1 decisions / open questions — react to these

1. **Regenerate vs. the LLM cache.** Spec originally said REGENERATE
   re-calls Claude for Describe-It inputs, but responses are cached by
   normalized-input hash, so an identical re-call returns identical JSON.
   Current behavior: regenerate re-rolls locally from the existing
   interpretation on every path. Alternative: a variation nonce that
   bypasses the cache (extra cost per regenerate). Which is right?
2. **Learning-system cold start.** Attribution needs ≥3 occurrences of a
   term before scoring. With one user (the owner) in the first iterations,
   is the evidence bar right? Should the first-weeks build default to a
   lower `minOccurrences` (2?) or a manual "flag this word" affordance so
   the owner can hand-mark suspects instantly?
3. **Bigram explosion / spurious suspects.** Terms are unigrams+bigrams
   from the whole prompt, so a bad generation smears blame across ~60 terms.
   Mitigations in place: Laplace smoothing, min-occurrence gate, "summons"
   weighting dominates the sort. Is that sufficient, or should attribution
   be restricted to descriptor-segments (comma-delimited chunks) rather than
   raw n-grams?
4. **Feedback granularity.** Ratings attach to the prompt text at rate-time
   (Output screen or Vault). There's no link to which *platform generation*
   (seed, model version) produced the audio. Worth adding a free-text
   "generation notes" field, or is that scope creep for v1?
5. **"Bare word" banning is aggressive.** Spec items like brass/horn/funk
   "(bare)" are banned outright in v1 (compounds too, except shielded
   "g-funk"). False-positive risk: "french horn" is intentional for someone,
   "shuffle" in a genre name. The Learning System can eventually *confirm*
   these; until then, is over-blocking the right default for the target user
   (trap/boom bap producers)?
6. **Traffic Light windows are folklore-based** (CET peak heuristic). It's
   client-side and swappable by design. Any better proxy available without a
   server-load API?
7. **Blend key_emotion** is currently borrowed from the Texture's first
   energy descriptor — a pragmatic stand-in. Better idea welcome.
8. **Not built (by spec):** payments (gate only), push notifications, direct
   Suno/Mureka APIs (none exist publicly), lyric content, social, light
   theme.

## Stack

Expo RN (iOS+Android, web preview capable) · Zustand (persisted via
AsyncStorage) · Supabase (Postgres/RLS/Edge Functions) · Claude
`claude-sonnet-4-6` for JSON extraction only · Voyage embeddings ·
Node built-in test runner for the engine (67 tests, all passing).

## Review round 1 — outcomes (Gemini, 2026-07-11)

Adopted and built: **(1)** Vault embedding vectors now pruned to the newest
20 versions (single-AsyncStorage-row size limit on Android); **(3)** Claude
over-generates 5-6 descriptors per category and REGENERATE re-samples the
pool locally (free); a separate NEW INTERPRETATION button bypasses the
shared cache and spends one daily credit (variants are not written back to
the cache); **(4)** attribution n-grams are scoped within comma-delimited
descriptor segments, and a named-offender co-occurrence counts from its
first occurrence — but only while evidence is scarce or leaning bad, so it
can't override a term with repeated 🔥 ratings; **(5)** the feedback modal
has a mandatory "Executed on: Suno v5.5 / Mureka V9" toggle; **(6)** a `!`
exemption prefix (`!brass`) shields a word from the kill list during manual
edits and is stripped from copied text; **(8)** Texture no longer colors
key_emotion — strict Foundation modality dominance.

Rejected: **(2)** schema hydration (already built, and `|| ["hip hop"]`
would silently invent a genre); **(9)** validation-order change (pipeline
already runs in that order, locked by tests). Deferred to owner: **(7)**
Traffic Light peak window (12:00–23:00 CET vs proposed 16:00–04:00 CET) —
both are heuristics; one constant to change either way.

## What happens next

Owner runs it via Expo Go (deterministic paths work with zero backend
setup), does the first feedback iterations personally, expands the decoder
DB toward 150 entries, then stands up Supabase for Describe It + cross-user
learning. Your review feeds one more build round in Claude Code before that.
