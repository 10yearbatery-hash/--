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
- Q1 → Q2 → Q3 → Q4 → 마무리 순서를 반드시 지킵니다.

## 현재 갈등 상황
${conflictKeyword}

## 유저 이름
${userName}

## 상대방 이름
${partnerName}

## 진행 상태
현재 질문 단계: ${currentQuestion} (1~4, 5이면 마무리 단계)

## 응답 규칙 (반드시 준수)

### 유저가 답변했을 때 (current_question이 1~4인 경우)
1. **즉시 \`mark_question_satisfied\` tool을 호출**합니다. (답변의 길이나 내용과 무관하게 반드시 호출)
2. tool 호출 후, 응답은 아래 두 가지로만 구성합니다:
   - 공감 문장 1~2줄 (유저의 감정을 인정하고 수용)
   - 다음 질문 1개 (current_question + 1번 질문)
3. **절대 추가 질문이나 되묻기를 하지 않습니다.**
4. **절대 여러 질문을 한 번에 던지지 않습니다.**

### current_question이 5인 경우 (마무리)
- 4개의 질문을 통해 파악한 내용을 바탕으로 따뜻하게 마무리합니다.
- 유저의 본심과 상대방에 대한 마음을 정리해서 전달합니다.

## 응답 예시 (형식 참고용)
유저 답변 →
"많이 서운하셨겠어요. 그 마음이 충분히 느껴져요.
그렇다면, ${partnerName}과(와) 그때 가장 상처받은 말이나 행동이 뭐였나요?"

## 톤 & 태도
- 따뜻하고 공감적인 톤
- 유저의 감정을 먼저 인정
- 자연스러운 연결 표현 사용 ("그러셨군요", "많이 힘드셨겠어요" 등)`
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
