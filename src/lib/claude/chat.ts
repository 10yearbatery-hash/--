import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.MINDLOGIC_API_KEY,
  baseURL: process.env.MINDLOGIC_BASE_URL,
})

// PRD 원문 고정 질문 텍스트
export const PRD_QUESTIONS: Record<number, string> = {
  2: `그러셨군요, 그 상황이라면 정말 속상하셨겠어요. 그럼 그때 상대방의 어떤 말이나 행동 때문에 가장 상처를 받으셨나요? 특히 어떤 부분이 제일 억울하셨는지 여기에 다 털어놓아 보세요. 제가 다 들어드릴게요.`,
  3: `말씀을 듣고 보니 얼마나 억울하셨을지 짐작이 가네요. 그렇다면 화나고 서운했던 그 마음 이면에는, 사실 상대방이 '내게 이렇게 해줬으면 좋았을 텐데' 하고 바랐던 진짜 속마음이 있었을 거예요. 그건 무엇이었나요?`,
  4: `맞아요, 사실은 그런 마음이셨군요. 상대방도 이 진심을 꼭 알았으면 좋겠어요. 그럼 마지막으로 우리, 입장을 한 번만 바꿔서 생각해 볼까요? 비록 동의하기는 어렵겠지만, 상대방은 대체 왜 그런 행동이나 말을 했을까요? 그 사람에게도 나름의 '사정'이나 '이유'가 있었다면 무엇이었을지 한번 짐작해 볼까요?`,
  5: `진심을 나눠주셔서 감사해요 💙\n\n혹시 추가로 더 하고 싶은 말씀이 있으신가요? 있다면 자유롭게 말씀해 주세요.`,
}

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

## 현재 갈등 상황
${conflictKeyword}

## 유저 이름: ${userName}
## 상대방 이름: ${partnerName}
## 현재 질문 단계: ${currentQuestion}

## 반드시 지킬 규칙
1. 유저가 뭔가 답변하면 **즉시 mark_question_satisfied tool을 호출**합니다.
2. **공감 문장 딱 1줄**만 생성합니다. 질문은 생성하지 않습니다. (질문은 시스템이 자동으로 추가합니다)
3. 공감 문장은 유저의 감정을 인정하고 수용하는 따뜻한 한 문장입니다.
4. 추가 질문, 되묻기, 긴 설명을 절대 하지 않습니다.

## 공감 문장 예시
- "5시간을 기다리셨다니 정말 많이 답답하셨겠어요."
- "그 상황에서 많이 속상하셨겠어요."
- "그런 마음이 충분히 이해가 돼요."

## 톤
- 따뜻하고 공감적
- 한 문장, 간결하게`
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
