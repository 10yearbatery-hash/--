CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN ('ai', 'user')),
  content        TEXT NOT NULL,
  question_stage INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_session_id ON messages(session_id);
