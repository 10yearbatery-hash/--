# DB 스키마 설계

## 기술 스택
- **DB:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (이메일 Magic Link)
- **클라이언트:** Supabase JS Client

---

## 테이블 목록

| 테이블 | 역할 |
|--------|------|
| `rooms` | 갈등 중재 방 (A가 생성, 6자리 코드로 공유) |
| `sessions` | A/B 각각의 채팅 세션 |
| `messages` | 각 세션의 채팅 메시지 |
| `results` | AI가 생성한 화해 결과 |
| `promises` | 유저가 저장한 약속 목록 |

> Supabase Auth의 `auth.users`는 기본 사용

---

## 1. rooms

```sql
CREATE TABLE rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  -- 6자리 영숫자 코드 (예: P96V9L)
  keyword       TEXT NOT NULL,
  creator_name  TEXT NOT NULL,
  partner_name  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'WAITING',
  -- WAITING: B 미입장
  -- A_DONE: A 완료, B 진행 중
  -- B_DONE: B 완료, A 진행 중
  -- BOTH_DONE: 양측 완료
  -- GENERATING: 결과 생성 중
  -- RESULT_READY: 결과 완료
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX idx_rooms_code ON rooms(code);
```

---

## 2. sessions

```sql
CREATE TABLE sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('A', 'B')),
  participant_name TEXT NOT NULL,
  session_token    TEXT NOT NULL UNIQUE,
  -- 비로그인 식별용 토큰, localStorage에 저장
  user_id          UUID REFERENCES auth.users(id),
  -- 로그인 시 연결
  status           TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  -- IN_PROGRESS | DONE
  current_question INT NOT NULL DEFAULT 1,
  -- 1~4, 완료 시 5
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
-- 한 방에 A 하나, B 하나만 존재
```

---

## 3. messages

```sql
CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role           TEXT NOT NULL CHECK (role IN ('ai', 'user')),
  content        TEXT NOT NULL,
  question_stage INT,
  -- 해당 메시지가 속한 질문 단계 (1~4, NULL이면 마무리)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
```

---

## 4. results

```sql
CREATE TABLE results (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id                UUID NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,

  -- Step 1
  situation_summary      TEXT NOT NULL,
  situation_highlight    TEXT NOT NULL,

  -- Step 2 (A)
  truth_a_hurt           TEXT NOT NULL,
  truth_a_need           TEXT NOT NULL,
  truth_a_understanding  TEXT NOT NULL,

  -- Step 2 (B)
  truth_b_hurt           TEXT NOT NULL,
  truth_b_need           TEXT NOT NULL,
  truth_b_understanding  TEXT NOT NULL,

  -- Step 3
  translation_body       TEXT NOT NULL,
  translation_highlight  TEXT NOT NULL,

  -- Step 4
  recommended_promises   JSONB NOT NULL DEFAULT '[]',
  -- [{ "id": "promise_1", "content": "..." }]

  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 5. promises

```sql
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
```

---

## 6. DB 트리거: 양측 완료 감지

```sql
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
```

---

## 7. ER 다이어그램

```
auth.users
  │
  ├──< sessions (user_id, nullable)
  │       │
  │       ├──< messages
  │       └── room_id ──┐
  │                     │
  └──< promises         ├── rooms
        └── room_id ────┤
                        └──< results
```
