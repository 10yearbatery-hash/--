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
