-- CIPHER — Learning System (feedback → trigger discovery → dynamic rules).
--
-- Flow:
--   1. Devices submit structured feedback on real generations (prompt_feedback).
--   2. The trigger_suspects view aggregates term-level evidence across all
--      users (terms are extracted client-side and submitted with the event).
--   3. The owner reviews suspects and promotes confirmed ones into
--      dynamic_rules; every app fetches confirmed rules on launch (24h cache)
--      and injects them into the banned-word filter — no app release needed.

CREATE TABLE prompt_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL,            -- 'suno' | 'mureka'
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('fire', 'ok', 'trash')),
  issues TEXT[] DEFAULT '{}',               -- issue tag ids (see ISSUE_TAGS)
  unwanted_text VARCHAR(200),               -- what showed up that shouldn't have
  prompt_text TEXT NOT NULL,                -- the style prompt as generated
  terms TEXT[] NOT NULL,                    -- extractTerms() output (client-side)
  is_bad BOOLEAN NOT NULL,                  -- isBadOutcome() (client-side)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_feedback_terms ON prompt_feedback USING GIN (terms);
CREATE INDEX idx_prompt_feedback_created ON prompt_feedback (created_at);

-- Aggregated term evidence across ALL users. The owner's review queue.
CREATE VIEW trigger_suspects AS
SELECT
  term,
  COUNT(*) FILTER (WHERE is_bad) AS bad,
  COUNT(*) FILTER (WHERE rating = 'fire') AS good,
  COUNT(*) FILTER (
    WHERE is_bad AND 'unwanted_element' = ANY(issues) AND unwanted_text IS NOT NULL
  ) AS summons,
  COUNT(*) AS total,
  -- Laplace-smoothed suspicion, matching the client-side math.
  ROUND(
    (COUNT(*) FILTER (WHERE is_bad) + 1)::NUMERIC
      / (COUNT(*) FILTER (WHERE is_bad) + COUNT(*) FILTER (WHERE rating = 'fire') + 2),
    3
  ) AS suspicion
FROM prompt_feedback, UNNEST(terms) AS term
GROUP BY term
HAVING COUNT(*) FILTER (WHERE is_bad) + COUNT(*) FILTER (WHERE rating = 'fire') >= 3
ORDER BY summons DESC, suspicion DESC, total DESC;

-- Owner-curated dynamic kill-list rules, served to every device.
CREATE TABLE dynamic_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(60) NOT NULL UNIQUE,
  substitute VARCHAR(120),                  -- NULL = strip instead of substitute
  status VARCHAR(20) NOT NULL DEFAULT 'suspected'
    CHECK (status IN ('suspected', 'confirmed', 'rejected')),
  evidence_note TEXT,                       -- owner's note, e.g. "summons sax 5/5"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security ---------------------------------------------------------
ALTER TABLE prompt_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_rules ENABLE ROW LEVEL SECURITY;

-- Devices can submit feedback; nobody can read others' raw feedback.
CREATE POLICY prompt_feedback_insert ON prompt_feedback
  FOR INSERT WITH CHECK (TRUE);

-- Every device reads CONFIRMED rules only; curation happens with the
-- service role (dashboard / owner tooling).
CREATE POLICY dynamic_rules_read ON dynamic_rules
  FOR SELECT USING (status = 'confirmed');
