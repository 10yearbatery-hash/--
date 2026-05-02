CREATE TABLE rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  keyword      TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'WAITING',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);
CREATE INDEX idx_rooms_code ON rooms(code);
