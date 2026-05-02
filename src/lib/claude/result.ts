import { anthropic } from './chat'

interface SessionSummary {
  q1: string
  q2: string
  q3: string
  q4: string
}

export interface ResultOutput {
  situation: { summary: string; highlight: string }
  truths: {
    a: { hurt: string; need: string; understanding: string }
    b: { hurt: string; need: string; understanding: string }
  }
  translation: { body: string; highlight: string }
  promises: Array<{ id: string; content: string }>
}

export async function generateResult(
  keyword: string,
  creatorName: string,
  partnerName: string,
  sessionA: SessionSummary,
  sessionB: SessionSummary
): Promise<ResultOutput> {
  const prompt = `다음 두 사람의 갈등 대화 요약을 바탕으로 화해 리포트를 JSON으로 생성하세요.

## 갈등 키워드: ${keyword}

## ${creatorName}(A)의 대화 요약
- 상황: ${sessionA.q1 || '정보 없음'}
- 가장 억울하고 아팠던 것: ${sessionA.q2 || '정보 없음'}
- 진짜 바랐던 것: ${sessionA.q3 || '정보 없음'}
- 상대방 입장 이해: ${sessionA.q4 || '정보 없음'}

## ${partnerName}(B)의 대화 요약
- 상황: ${sessionB.q1 || '정보 없음'}
- 가장 억울하고 아팠던 것: ${sessionB.q2 || '정보 없음'}
- 진짜 바랐던 것: ${sessionB.q3 || '정보 없음'}
- 상대방 입장 이해: ${sessionB.q4 || '정보 없음'}

## 생성 원칙
- 비난을 필터링하고 진심과 억울함만 남깁니다.
- 공감적이고 따뜻한 톤을 유지합니다.
- 두 사람의 갈등이 서로를 향한 애정에서 비롯되었음을 강조합니다.
- 약속은 구체적이고 실천 가능하게 3~5개 제안합니다.
- 모든 텍스트는 한국어로 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트는 절대 포함하지 마세요:
{
  "situation": { "summary": "2~3문장 객관적 상황 요약", "highlight": "핵심 한 줄" },
  "truths": {
    "a": { "hurt": "가장 속상했던 부분", "need": "정말 바랐던 것", "understanding": "상대 이해" },
    "b": { "hurt": "가장 속상했던 부분", "need": "정말 바랐던 것", "understanding": "상대 이해" }
  },
  "translation": { "body": "2~4문장 공감형 분석", "highlight": "핵심 한 줄" },
  "promises": [
    { "id": "promise_1", "content": "약속 내용" },
    { "id": "promise_2", "content": "약속 내용" },
    { "id": "promise_3", "content": "약속 내용" }
  ]
}`

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('결과 JSON 파싱 실패: ' + text.slice(0, 100))
  }
  return JSON.parse(jsonMatch[0]) as ResultOutput
}
