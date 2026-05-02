CREATE TABLE results (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id                UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
  situation_summary      TEXT NOT NULL,
  situation_highlight    TEXT NOT NULL,
  truth_a_hurt           TEXT NOT NULL,
  truth_a_need           TEXT NOT NULL,
  truth_a_understanding  TEXT NOT NULL,
  truth_b_hurt           TEXT NOT NULL,
  truth_b_need           TEXT NOT NULL,
  truth_b_understanding  TEXT NOT NULL,
  translation_body       TEXT NOT NULL,
  translation_highlight  TEXT NOT NULL,
  recommended_promises   JSONB NOT NULL DEFAULT '[]',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
