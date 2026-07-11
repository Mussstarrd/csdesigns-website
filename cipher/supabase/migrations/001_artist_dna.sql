-- CIPHER — Artist Decoder database (server-side, era-tagged).
-- Hosted in Supabase so entries update without app releases.

CREATE TABLE artist_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name VARCHAR(200) NOT NULL,        -- never appears in output prompts
  era_label VARCHAR(200) NOT NULL,          -- e.g. "College Dropout era (2003-2005)"
  era_start INTEGER,
  era_end INTEGER,
  region VARCHAR(100),
  bpm_min INTEGER,
  bpm_max INTEGER,
  key_preference VARCHAR(50),
  feel TEXT,
  percussion_dna TEXT[],                    -- physical sensation language
  low_end_dna TEXT[],
  lead_dna TEXT[],
  arrangement_dna TEXT[],
  energy_dna TEXT[],
  room_dna TEXT[],
  avoid_list TEXT[],                        -- production elements that conflict
  anchor_tokens TEXT[],                     -- heavily weighted tokens forcing latent-space pocket
  display_order INTEGER,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_name, era_label)
);

CREATE INDEX idx_artist_dna_active ON artist_dna (active, display_order);
CREATE INDEX idx_artist_dna_name ON artist_dna (artist_name);

-- "Suggest an artist" form in Settings writes here.
CREATE TABLE artist_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name VARCHAR(200) NOT NULL,
  era_hint VARCHAR(200),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Describe-It LLM response cache, keyed by normalized-input hash.
-- Identical inputs across ALL users serve the cached JSON (cost control).
CREATE TABLE prompt_cache (
  input_hash TEXT PRIMARY KEY,              -- sha-256 of normalized input
  interpretation JSONB NOT NULL,            -- validated Stage-1 JSON
  model VARCHAR(60) NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Server-side enforcement of the free tier (10 Describe-It calls/day).
CREATE TABLE usage_counters (
  device_id TEXT NOT NULL,
  day DATE NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (device_id, day)
);

-- Row Level Security ------------------------------------------------------
ALTER TABLE artist_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;

-- The decoder DB is public read (anon key) — it's the product content.
CREATE POLICY artist_dna_read ON artist_dna
  FOR SELECT USING (active = TRUE);

-- Anyone can suggest an artist; nobody can read others' suggestions.
CREATE POLICY artist_suggestions_insert ON artist_suggestions
  FOR INSERT WITH CHECK (TRUE);

-- prompt_cache and usage_counters are touched ONLY by the Edge Functions
-- (service role bypasses RLS); no anon policies on purpose.

-- Atomic daily-quota increment used by the interpret Edge Function.
CREATE OR REPLACE FUNCTION increment_usage(p_device_id TEXT, p_limit INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO usage_counters (device_id, day, count)
  VALUES (p_device_id, CURRENT_DATE, 1)
  ON CONFLICT (device_id, day)
  DO UPDATE SET count = usage_counters.count + 1
  WHERE usage_counters.count < p_limit
  RETURNING count INTO new_count;
  -- NULL means the limit was already reached (the UPDATE was filtered out).
  RETURN new_count;
END;
$$;
