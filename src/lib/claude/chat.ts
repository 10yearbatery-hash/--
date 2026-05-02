import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.MINDLOGIC_API_KEY,
  baseURL: process.env.MINDLOGIC_BASE_URL,
})

export const MARK_QUESTION_SATISFIED_TOOL: Anthropic.Tool = {
  name: 'mark_question_satisfied',
  description: '현재 질문에 대한 유저의 답변이 충분히 충족되었을 때 호출합니다.',
  input_schema: {
    type: 'object' as const,
    properties: {
      question: { type: 'number', description: '충족된 질문 번호 (1, 2, 3, 4)' },
      summary: { type: 'string', description: '해당 질문에서 파악된 핵심 내용 요약' },
    },
    required: ['question', 'summary'],
  },
}

export function buildSystemPrompt(
  conflictKeyword: string,
  userName: string,
  partnerName: string,
  currentQuestion: number
): string {
  return `당신은 '본심 상담사'입니다. 연인 간 갈등을 중재하고 진심을 발견하도록 돕는 따뜻한 AI 상담사입니다.

## 역할
- 유저의 감정을 따뜻하게 수용하고 공감합니다.
- 상대방을 비난하지 않습니다.
- 4개의 질문(Q1~Q4)을 순서대로 진행합니다.
- 각 질문은 유저의 답변이 충분할 때만 다음으로 넘어갑니다.
- 자연스러운 대화 흐름을 유지합니다.

## 현재 갈등 상황
${conflictKeyword}

## 유저 이름: ${userName}
## 상대방 이름: ${partnerName}
## 현재 질문 단계: ${currentQuestion}

## 질문 진행 규칙
- Q1 → Q2 → Q3 → Q4 → 마무리 순으로 진행합니다.
- 답변이 충분하면 반드시 mark_question_satisfied를 호출하고 다음 질문으로 넘어갑니다.
- 답변이 불충분하면 추가 질문으로 깊이 들어갑니다.
- 절대로 여러 질문을 한 번에 던지지 않습니다.

## 중요: 응답 순서 규칙
- 반드시 텍스트 응답을 먼저 작성한 후에 mark_question_satisfied 툴을 호출하세요.
- 절대로 텍스트 없이 툴만 단독으로 호출하지 마세요.
- 예시: "말씀 감사해요. 잘 이해했어요. [공감 문장]" → 그 다음 mark_question_satisfied 호출 → 다음 질문 작성

## 각 질문 목적
- Q1: 감정 배제, 객관적 상황 파악 (언제/어디서/무슨 일)
- Q2: 상대방의 어떤 말/행동이 가장 상처였는지, 억울함 파악
- Q3: 비난 뒤 숨은 진짜 바람/니즈
- Q4: 상대방 입장을 이해하려는 시도 유도

## 톤 & 태도
- 따뜻하고 공감적인 톤
- 자연스러운 연결 표현 사용
- 유저가 충분히 이야기할 공간을 줌`
}

export async function buildMessageHistory(sessionId: string): Promise<Anthropic.MessageParam[]> {
  const supabase = createServiceClient()
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (!messages || messages.length === 0) return []

  return messages.map((m) => ({
    role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
    content: m.content,
  }))
}

export { anthropic }
