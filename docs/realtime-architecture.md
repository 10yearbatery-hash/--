# 실시간 아키텍처 명세

## 1. 개요

본 서비스의 핵심 기술 과제는 **A와 B가 각각 독립된 채팅을 완료했을 때 자동으로 결과를 생성**하는 것이다.
Supabase Realtime을 통해 room.status 변화를 구독하고, DB 트리거로 상태 전이를 자동화한다.

---

## 2. 상태 머신

```
WAITING
  │
  ├─ A가 채팅 시작 → (상태 변경 없음, session A 생성됨)
  ├─ B가 입장 → (상태 변경 없음, session B 생성됨)
  │
  ├─ A 완료, B 미완료 → A_DONE
  ├─ B 완료, A 미완료 → B_DONE
  │
  ├─ A_DONE 상태에서 B 완료 → BOTH_DONE
  ├─ B_DONE 상태에서 A 완료 → BOTH_DONE
  │
  └─ BOTH_DONE → (Edge Function 트리거) → GENERATING → RESULT_READY
```

### 상태 전이 트리거

| 이벤트 | 이전 상태 | 이후 상태 | 처리 주체 |
|--------|----------|----------|----------|
| A 세션 완료 | WAITING | A_DONE | DB 트리거 |
| B 세션 완료 | WAITING | B_DONE | DB 트리거 |
| B 세션 완료 | A_DONE | BOTH_DONE | DB 트리거 |
| A 세션 완료 | B_DONE | BOTH_DONE | DB 트리거 |
| 결과 생성 시작 | BOTH_DONE | GENERATING | Edge Function |
| 결과 생성 완료 | GENERATING | RESULT_READY | Edge Function |

---

## 3. Supabase Realtime 구독

### 클라이언트 구독 채널

```typescript
// 채팅방 페이지에서 room status 구독
const channel = supabase
  .channel(`room:${roomId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'rooms',
      filter: `id=eq.${roomId}`,
    },
    (payload) => {
      const newStatus = payload.new.status;
      handleRoomStatusChange(newStatus);
    }
  )
  .subscribe();
```

### 상태별 UI 처리

```typescript
function handleRoomStatusChange(status: string) {
  switch (status) {
    case 'A_DONE':
    case 'B_DONE':
      // 내가 완료한 경우: "상대방이 아직 본심을 기록하고 있습니다..."
      if (mySessionDone) showWaitingMessage();
      break;
    case 'BOTH_DONE':
    case 'GENERATING':
      // "두 분의 진심을 바탕으로 결과를 생성하고 있습니다..."
      showGeneratingMessage();
      break;
    case 'RESULT_READY':
      // "결과 생성이 완료됐어요 ✨" + [결과보러가기] 버튼
      showResultReadyMessage();
      break;
  }
}
```

---

## 4. 결과 생성 Edge Function

### 트리거 조건
- room.status = 'BOTH_DONE'으로 변경될 때 자동 호출
- Supabase DB Webhook 또는 API Route polling으로 감지

### 처리 흐름

```
BOTH_DONE 감지
  │
  ├─ room.status = GENERATING 으로 업데이트 (중복 실행 방지)
  │
  ├─ sessions A, B의 q1~q4 summary 조회
  │
  ├─ Claude API 호출 (결과 생성 프롬프트)
  │   └─ 입력: conflict_keyword, creator_name, partner_name, session_a, session_b
  │   └─ 출력: ResultOutput JSON
  │
  ├─ results 테이블에 INSERT
  │
  └─ room.status = RESULT_READY 로 업데이트
      └─ Realtime으로 A, B 클라이언트에 전파
```

### Edge Function 구현 (의사코드)

```typescript
// supabase/functions/generate-result/index.ts
export async function generateResult(roomId: string) {
  // 1. 중복 실행 방지
  const { data: room } = await supabase
    .from('rooms')
    .select('status')
    .eq('id', roomId)
    .single();

  if (room.status !== 'BOTH_DONE') return;

  await supabase
    .from('rooms')
    .update({ status: 'GENERATING' })
    .eq('id', roomId);

  // 2. 세션 데이터 조회
  const { data: sessions } = await supabase
    .from('sessions')
    .select('role, participant_name, q1_summary, q2_summary, q3_summary, q4_summary')
    .eq('room_id', roomId);

  // 3. Claude API 호출
  const result = await callClaudeForResult(room, sessions);

  // 4. 결과 저장
  await supabase.from('results').insert({
    room_id: roomId,
    ...result
  });

  // 5. 완료 상태로 전환 → Realtime 전파
  await supabase
    .from('rooms')
    .update({ status: 'RESULT_READY' })
    .eq('id', roomId);
}
```

---

## 5. 연결 끊김 복구

페이지 재진입(새로고침, 뒤로가기 후 재접속) 시:

```typescript
async function restoreSession(sessionToken: string) {
  // 1. session_token으로 세션 조회
  const session = await getSessionByToken(sessionToken);
  if (!session) return redirectToHome();

  // 2. room status 조회
  const room = await getRoomById(session.room_id);

  // 3. 상태에 따라 적절한 화면으로 복원
  if (room.status === 'RESULT_READY') {
    showResultReadyMessage(); // 결과 확인 버튼 표시
  } else if (session.status === 'DONE') {
    showWaitingMessage();     // 상대방 대기 메시지
  } else {
    restoreChatHistory();     // 기존 메시지 이어서 표시
    resumeChat();             // current_question부터 재개
  }
}
```

---

## 6. A↔B 데이터 격리

- A는 자신의 session_id에 속한 메시지만 접근 가능
- B는 자신의 session_id에 속한 메시지만 접근 가능
- 결과 페이지에서만 양측 데이터가 합쳐진 형태로 표시됨 (results 테이블)
- 세부 격리 정책은 `docs/security-rls.md` 참조

---

## 7. AI 스트리밍 처리

```typescript
// API Route: POST /api/chat/[sessionId]/message
export async function POST(req: Request) {
  const { content } = await req.json();

  // 유저 메시지 저장
  await saveMessage(sessionId, 'user', content);

  // Claude API 스트리밍 호출
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(session),
    messages: await buildMessageHistory(sessionId),
    tools: [markQuestionSatisfiedTool],
  });

  // 스트리밍 응답 반환 (SSE)
  return new Response(stream.toReadableStream(), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```
