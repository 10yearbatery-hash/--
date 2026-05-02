CREATE TABLE sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('A', 'B')),
  participant_name TEXT NOT NULL,
  session_token    TEXT NOT NULL UNIQUE,
  user_id          UUID REFERENCES auth.users(id),
  status           TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  current_question INT NOT NULL DEFAULT 1,
  q1_summary       TEXT,
  q2_summary       TEXT,
  q3_summary       TEXT,
  q4_summary       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ
);
CREATE INDEX idx_sessions_room_id ON sessions(room_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE UNIQUE INDEX idx_sessions_room_role ON sessions(room_id, role);
