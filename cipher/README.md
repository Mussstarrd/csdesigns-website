# CIPHER

**Prompt engineering, decoded.** CIPHER is a mobile app (iOS + Android, React Native / Expo) that helps rap artists and beat producers craft optimized, rule-compliant prompts for AI music generation platforms — **Suno v5.5** and **Mureka V9** — simultaneously.

CIPHER is a **Deterministic Ruleset Engine with LLM Interpretation** — not an LLM wrapper. The Claude API is used *only* to translate free-text descriptions into structured JSON tags. All final string assembly, character counting, banned-word filtering, exclusion formatting, and validation is done by deterministic local code, because LLMs cannot count characters reliably and local code can.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React Native via **Expo** (single codebase, iOS + Android) |
| State | **Zustand** |
| Backend / DB | **Supabase** (Postgres + Auth + Edge Functions) — hosts the Artist Decoder database server-side |
| LLM | **Claude API** (`claude-sonnet-4-6`) — JSON tag extraction ONLY, proxied through a Supabase Edge Function. The API key never ships in the app bundle. |
| Embeddings | API-based sentence embeddings for the Freshness Score (cosine similarity); Jaccard word-overlap fallback when offline |
| Local storage | AsyncStorage (Vault, settings, cached prompts, cached Artist Decoder DB) |
| Character counting | Programmatic, real-time, local — never estimated, never delegated to the LLM |

## Repository layout

```
cipher/
  App.js                     App entry — navigation + store hydration
  src/
    engine/                  ★ The deterministic prompt engine (pure JS, no RN deps)
      promptAssembler.js       Stage 2 — Prompt Stack assembly, per-build budgets, truncation
      bannedWords.js           Evidence-tiered word rules: hard (dynamic) / watch / attractors
      groove.js                Groove slot — 3 rhythm vocabularies, budgets, stabilizers
      deltaLoop.js             Failure report → deterministic corrective rebuild
      exclusions.js            Exclude-field formatter (≤5) + conflict map + inversion table
      murekaFormatter.js       Mureka Music Style / Vocal Direction / Structure Block
      structureCanon.js        Canonical hit-structure → Suno scaffold + Mureka bar blocks
      structureTemplates.js    Genre/energy instrumental structure templates
      validator.js             Stage 3 — char counts, conflicts, forbidden-word sweep
      freshness.js             Cosine similarity + Jaccard fallback scoring
      seedAudio.js             Seed Audio Context category omission + complement language
      surpriseMe.js            Deterministic curated random combinations (no LLM)
      blend.js                 Foundation + Texture constraint hierarchy
      interpretationSchema.js  Validation of Claude's JSON output (Stage 1 contract)
      trafficLight.js          CET peak/shoulder/off-peak window calculation
      __tests__/               Unit tests for every hard rule (node --test)
    data/
      seedArtists.js           25 fully-written artist-era DNA entries
      vibes.js                 Region-era / vibe / production-style chip data
    services/                Supabase client, decoder fetch+cache, Claude proxy client,
                             embeddings client, daily usage counter
    store/                   Zustand stores (prompt, vault, settings, decoder)
    screens/                 Home, DescribeIt, BuildIt, BlendIt, Output, Vault,
                             Settings, ArtistBrowser, Paywall stub
    components/              TrafficLight, CharCounter, FreshnessBadge, chips, cards…
    navigation/              Bottom tabs (Create | Vault | Settings) + stacks
    theme/                   Dark-only design tokens
  supabase/
    migrations/              artist_dna, artist_suggestions, prompt_cache tables
    seed/                    SQL seed for the 25 launch artist-era entries
    functions/
      interpret/             Edge Function proxying Claude (JSON extraction + cache + quota)
      embed/                 Edge Function proxying the embeddings endpoint
```

## Setup

### Prerequisites

- Node 20+ and npm
- Expo tooling: `npx expo` (bundled via `npx`, no global install needed)
- A Supabase project (free tier works)
- An Anthropic API key (server-side only)
- iOS Simulator (macOS) and/or Android emulator, or the Expo Go app on a device

### 1. Install app dependencies

```bash
cd cipher
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations and seed in the SQL editor (or via the CLI):

```bash
# with the Supabase CLI linked to your project:
supabase db push                                  # applies supabase/migrations/*
psql "$SUPABASE_DB_URL" -f supabase/seed/001_seed_artist_dna.sql
```

3. Deploy the Edge Functions and set the server-side secrets:

```bash
supabase functions deploy interpret
supabase functions deploy embed
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

> The Anthropic key lives **only** in Supabase secrets. The app calls the
> `interpret` Edge Function; it never talks to the Claude API directly.

### 3. Configure the app environment

Copy the example env file and fill in your Supabase project values (these are
the *public* anon values — safe to ship):

```bash
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

### 4. Run the app

```bash
npm start            # Expo dev server — press i for iOS, a for Android
```

The app works offline for all deterministic paths (Build It / Blend It) using
the cached Artist Decoder database; Describe It requires connectivity.

## Running the engine unit tests

The prompt engine is pure JavaScript with zero React Native dependencies, so
its rule-enforcement tests run with Node's built-in test runner — no device,
no emulator, no jest install:

```bash
cd cipher
npm test             # node --test src/engine/__tests__/
```

Every hard rule has a test: the 990-char ceiling and back-first truncation,
instrumental-tag-last, exclusion cap and separation from the Style field,
banned-word filtering + substitution, artist-name scrubbing, Prompt Stack
ordering, Mureka BPM→feel conversion, structure-block injection, blend
hierarchy, and seed-audio omission.

## The Learning System (trigger discovery)

The static kill list encodes *known* trigger words; the Learning System
discovers new ones from real generations:

1. After running a prompt on Suno/Mureka, the user rates the result
   (🔥/😐/🗑) on the Output screen or in the Vault, tags what went wrong
   (unwanted element, genre drift, muddy mix, ignored exclusion…), and can
   name the element that appeared uninvited.
2. `src/engine/feedbackAttribution.js` deterministically attributes outcomes
   to prompt terms (unigrams + bigrams): every term accumulates good/bad
   evidence; terms co-occurring with a *named* unwanted element carry the
   strongest weight. Suspects surface locally in Settings → Trigger Lab.
3. Feedback also syncs to Supabase (`prompt_feedback`), where the
   `trigger_suspects` view aggregates evidence across all users.
4. The owner reviews suspects and promotes confirmed ones into the
   `dynamic_rules` table. Every app fetches confirmed rules on launch
   (24h cache) and injects them into the banned-word filter — the kill list
   grows **without an app release**.

## Free tier / cost controls

- **Build It** and **Blend It** are fully deterministic — no Claude call, unlimited and free.
- **Describe It** uses Claude via the Edge Function: 10 generations/day free
  (counter enforced client-side and server-side). The Pro paywall is a stub —
  no payment integration in v1.
- Describe It responses are cached in Supabase by normalized-input hash, so
  identical inputs across all users are served from cache without an API call.

## What is intentionally NOT in v1

Payment processing (gate + counter only) · push notifications · direct
Suno/Mureka API integration · lyric content writing (structure tags only) ·
social/sharing · light theme.
