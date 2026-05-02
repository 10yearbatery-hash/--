CREATE TABLE promises (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id    UUID REFERENCES rooms(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  is_custom  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_promises_user_id ON promises(user_id);
CREATE INDEX idx_promises_created_at ON promises(user_id, created_at DESC);
