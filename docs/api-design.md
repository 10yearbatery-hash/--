# API 설계

## 기술 스택
- **라우팅:** Next.js App Router API Routes
- **인증:** session_token (헤더) + Supabase Auth (쿠키)
- **스트리밍:** Server-Sent Events (SSE)

---

## 인증 방식

| 유형 | 방식 | 사용 위치 |
|------|------|----------|
| 비로그인 세션 | `X-Session-Token` 헤더 | 채팅 관련 API |
| 로그인 유저 | Supabase Auth 쿠키 | 약속 저장 API |

---

## 1. 방 생성

### `POST /api/rooms`

방을 생성하고 6자리 코드와 A 세션을 발급한다.

**Request Body:**
```json
{
  "keyword": "연락 빈도",
  "creatorName": "지민",
  "partnerName": "수현"
}
```

**Response 200:**
```json
{
  "roomId": "uuid",
  "roomCode": "P96V9L",
  "sessionToken": "uuid",  // A의 session_token, localStorage에 저장
  "sessionId": "uuid"
}
```

**에러:**
- `400` keyword/creatorName/partnerName 누락

---

## 2. 방 정보 조회

### `GET /api/rooms/[code]`

B가 코드 입력 시 방 정보를 조회한다.

**Response 200:**
```json
{
  "roomId": "uuid",
  "keyword": "연락 빈도",
  "creatorName": "지민",
  "partnerName": "수현",
  "status": "WAITING"
}
```

**에러:**
- `404` 코드 없음 또는 만료됨

---

## 3. B 입장 (세션 생성)

### `POST /api/rooms/[roomId]/join`

B가 채팅방에 입장하며 B 세션을 생성한다.

**Request Body:**
```json
{}
```

**Response 200:**
```json
{
  "sessionToken": "uuid",  // B의 session_token
  "sessionId": "uuid"
}
```

**에러:**
- `404` roomId 없음
- `409` B 세션이 이미 존재함

---

## 4. 채팅 메시지 전송 (스트리밍)

### `POST /api/chat/[sessionId]/message`

유저 메시지를 저장하고 AI 응답을 SSE로 스트리밍한다.

**Headers:**
```
X-Session-Token: {sessionToken}
```

**Request Body:**
```json
{
  "content": "어제 약속 시간에 30분이나 늦었어요..."
}
```

**Response:** `text/event-stream`
```
data: {"type":"delta","text":"그러셨군요"}
data: {"type":"delta","text":", 많이"}
data: {"type":"tool_use","name":"mark_question_satisfied","input":{"question":1,"summary":"약속 시간 30분 지각 문제"}}
data: {"type":"done"}
```

**에러:**
- `401` session_token 불일치
- `403` 세션 이미 완료됨
- `404` sessionId 없음

---

## 5. 세션 완료 처리

### `POST /api/sessions/[sessionId]/finish`

마무리 단계 완료 시 세션을 DONE으로 처리한다.

**Headers:**
```
X-Session-Token: {sessionToken}
```

**Response 200:**
```json
{
  "status": "DONE",
  "roomStatus": "A_DONE"  // 현재 room status
}
```

**에러:**
- `401` session_token 불일치
- `409` 이미 완료됨

---

## 6. 결과 조회

### `GET /api/rooms/[roomId]/result`

결과 페이지 데이터를 조회한다.

**Headers:**
```
X-Session-Token: {sessionToken}
```

**Response 200:**
```json
{
  "situation": {
    "summary": "두 사람은 '약속 시간 지각' 문제로...",
    "highlight": "두 분 모두 서로를 소중히 여기기 때문에 더 아팠던 거예요"
  },
  "truths": {
    "a": {
      "hurt": "기다리는 30분이 너무 길고 외로웠어요...",
      "need": "제 시간을 소중히 여겨줬으면 했어요...",
      "understanding": "요즘 야근이 많아서 힘들었겠구나..."
    },
    "b": {
      "hurt": "...",
      "need": "...",
      "understanding": "..."
    }
  },
  "translation": {
    "body": "두 분의 갈등은 서로를 미워해서가 아니라...",
    "highlight": "두 분은 지금 멀어진 게 아니라, 서로를 향한 마음이 너무 커서 조금 엉켜 있는 거예요."
  },
  "promises": [
    { "id": "promise_1", "content": "다음에 비슷한 상황이 생기면..." },
    { "id": "promise_2", "content": "서로 화가 났을 때는..." }
  ],
  "creatorName": "지민",
  "partnerName": "수현"
}
```

**에러:**
- `401` 방 참여자가 아님
- `404` 결과 미생성 (status != RESULT_READY)

---

## 7. 약속 저장

### `POST /api/promises`

선택/입력한 약속을 저장한다. **로그인 필수.**

**Request Body:**
```json
{
  "roomId": "uuid",
  "promises": [
    { "content": "다음에 비슷한 상황이 생기면...", "isCustom": false },
    { "content": "우리가 직접 쓴 약속", "isCustom": true }
  ]
}
```

**Response 200:**
```json
{
  "saved": 2
}
```

**에러:**
- `401` 미로그인
- `400` promises 배열 누락

---

## 8. 약속 목록 조회

### `GET /api/promises`

로그인한 유저의 약속 목록을 최신순으로 반환한다. **로그인 필수.**

**Response 200:**
```json
{
  "promises": [
    {
      "id": "uuid",
      "content": "다음에 비슷한 상황이 생기면...",
      "isCustom": false,
      "createdAt": "2026-05-02T17:00:00Z"
    }
  ]
}
```

---

## 9. 공통 에러 형식

```json
{
  "error": "ERROR_CODE",
  "message": "사용자에게 보여줄 메시지"
}
```

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_INPUT` | 400 | 필수 파라미터 누락/형식 오류 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 중복 요청 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |
