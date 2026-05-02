-- ============================================================
-- 본심(Bon-Sim) DB 스키마 통합 실행 파일
-- Supabase 대시보드 SQL Editor에서 한 번에 실행
-- ============================================================

-- 001: rooms 테이블
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

-- 002: sessions 테이블
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

-- 003: messages 테이블
CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN ('ai', 'user')),
  content        TEXT NOT NULL,
  question_stage INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_session_id ON messages(session_id);

-- 004: results 테이블
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

-- 005: promises 테이블
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

-- 006: 트리거 - 세션 완료 시 방 상태 자동 업데이트
CREATE OR REPLACE FUNCTION update_room_status_on_session_done()
RETURNS TRIGGER AS $$
DECLARE
  other_status TEXT;
  other_role   TEXT;
BEGIN
  IF NEW.role = 'A' THEN other_role := 'B';
  ELSE other_role := 'A';
  END IF;

  SELECT status INTO other_status
  FROM sessions
  WHERE room_id = NEW.room_id AND role = other_role;

  IF other_status = 'DONE' THEN
    UPDATE rooms SET status = 'BOTH_DONE' WHERE id = NEW.room_id;
  ELSIF NEW.role = 'A' THEN
    UPDATE rooms SET status = 'A_DONE' WHERE id = NEW.room_id;
  ELSE
    UPDATE rooms SET status = 'B_DONE' WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_done
  AFTER UPDATE OF status ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'DONE' AND OLD.status != 'DONE')
  EXECUTE FUNCTION update_room_status_on_session_done();

-- 007: RLS (Row Level Security) 정책
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;

-- rooms: 누구나 조회 가능
CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (true);

-- sessions: session_token 기반 본인만
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT
  USING (session_token = (current_setting('request.headers', true)::json->>'x-session-token'));
CREATE POLICY "sessions_update_own" ON sessions FOR UPDATE
  USING (session_token = (current_setting('request.headers', true)::json->>'x-session-token'));

-- messages: 본인 session에 속한 것만
CREATE POLICY "messages_select_own" ON messages FOR SELECT
  USING (session_id IN (
    SELECT id FROM sessions
    WHERE session_token = (current_setting('request.headers', true)::json->>'x-session-token')
  ));
CREATE POLICY "messages_insert_own" ON messages FOR INSERT
  WITH CHECK (session_id IN (
    SELECT id FROM sessions
    WHERE session_token = (current_setting('request.headers', true)::json->>'x-session-token')
  ));

-- results: 방 참여자만 조회
CREATE POLICY "results_select_participant" ON results FOR SELECT
  USING (room_id IN (
    SELECT room_id FROM sessions
    WHERE session_token = (current_setting('request.headers', true)::json->>'x-session-token')
  ));

-- promises: 본인 것만
CREATE POLICY "promises_select_own" ON promises FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "promises_insert_own" ON promises FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "promises_delete_own" ON promises FOR DELETE USING (user_id = auth.uid());
