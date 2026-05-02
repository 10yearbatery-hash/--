# Supabase RLS 보안 정책

## 핵심 원칙

1. **A는 B의 메시지를 절대 볼 수 없다** (역도 마찬가지)
2. **비로그인 상태에서도 채팅 가능** (session_token 기반)
3. **약속 저장은 로그인 필수**
4. **Service Role 키는 서버(Edge Function)에서만 사용**

---

## 1. rooms 테이블 RLS

```sql
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 누구나 코드로 방 조회 가능 (URL 접속 기반)
CREATE POLICY "rooms_select_by_code"
ON rooms FOR SELECT
USING (true);
-- 실제 접근 제어는 API Route에서 session_token으로 처리

-- 방 생성은 API Route에서 service role로 처리 (클라이언트 직접 INSERT 불가)
```

---

## 2. sessions 테이블 RLS

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 자신의 session_token으로만 SELECT
CREATE POLICY "sessions_select_own"
ON sessions FOR SELECT
USING (
  session_token = current_setting('request.headers', true)::json->>'x-session-token'
);

-- 자신의 session_token으로만 UPDATE
CREATE POLICY "sessions_update_own"
ON sessions FOR UPDATE
USING (
  session_token = current_setting('request.headers', true)::json->>'x-session-token'
);

-- INSERT는 service role만 가능 (클라이언트 직접 생성 불가)
```

---

## 3. messages 테이블 RLS

```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 자신의 session에 속한 메시지만 SELECT
CREATE POLICY "messages_select_own_session"
ON messages FOR SELECT
USING (
  session_id IN (
    SELECT id FROM sessions
    WHERE session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);

-- 자신의 session에만 INSERT
CREATE POLICY "messages_insert_own_session"
ON messages FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM sessions
    WHERE session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);

-- UPDATE/DELETE 불가 (메시지는 불변)
```

> **핵심:** A의 session_token으로는 B의 messages에 접근 불가. B도 마찬가지.

---

## 4. results 테이블 RLS

```sql
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 방 참여자(A 또는 B)만 결과 조회 가능
CREATE POLICY "results_select_room_participants"
ON results FOR SELECT
USING (
  room_id IN (
    SELECT room_id FROM sessions
    WHERE session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);

-- INSERT는 service role만 가능 (Edge Function에서 처리)
```

---

## 5. promises 테이블 RLS

```sql
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;

-- 자신의 약속만 SELECT
CREATE POLICY "promises_select_own"
ON promises FOR SELECT
USING (user_id = auth.uid());

-- 자신의 약속만 INSERT
CREATE POLICY "promises_insert_own"
ON promises FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 자신의 약속만 DELETE
CREATE POLICY "promises_delete_own"
ON promises FOR DELETE
USING (user_id = auth.uid());
```

---

## 6. Service Role 키 사용 위치

| 작업 | 처리 주체 | 이유 |
|------|----------|------|
| 방 생성 (rooms INSERT) | API Route (서버) | 클라이언트가 임의 방 생성 방지 |
| 세션 생성 (sessions INSERT) | API Route (서버) | role 조작 방지 |
| AI 응답 저장 (messages INSERT) | API Route (서버) | role='ai' 조작 방지 |
| 결과 생성/저장 | Edge Function | 양측 데이터 접근 필요 |
| room.status 업데이트 | DB 트리거 / Edge Function | 클라이언트 상태 조작 방지 |

**`.env.local`에서 `SUPABASE_SERVICE_ROLE_KEY`는 서버 코드에서만 사용. `NEXT_PUBLIC_` 접두사 절대 금지.**

---

## 7. 익명 접근 흐름

```
비로그인 유저
  │
  ├─ 방 만들기 → API Route가 session_token 발급 → localStorage 저장
  ├─ 채팅 → 모든 요청에 X-Session-Token 헤더 포함
  ├─ 결과 조회 → session_token으로 참여자 검증
  │
  └─ 약속 저장 클릭
        └─ 로그인 페이지 이동
             └─ Magic Link 로그인 완료
                  └─ session.user_id 업데이트
                       └─ 약속 저장 (auth.uid() 사용)
```

---

## 8. 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 `NEXT_PUBLIC_` 없이 서버 전용으로만 사용됨
- [ ] RLS가 모든 테이블에 활성화됨
- [ ] A의 session_token으로 B의 messages 조회 시 빈 배열 반환됨 (테스트 필요)
- [ ] 결과 페이지에서 room 참여자가 아닌 유저 접근 시 404 반환됨
- [ ] session_token이 URL 파라미터가 아닌 localStorage + 헤더로만 전달됨
