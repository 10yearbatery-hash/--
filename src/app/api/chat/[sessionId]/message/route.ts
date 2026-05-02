import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  anthropic,
  buildSystemPrompt,
  buildMessageHistory,
  MARK_QUESTION_SATISFIED_TOOL,
  PRD_QUESTIONS,
} from '@/lib/claude/chat'

export const maxDuration = 60

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const sessionToken = req.headers.get('x-session-token')
  const { content } = await req.json()

  if (!content || !sessionToken) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id, room_id, role, participant_name, status, current_question, session_token')
    .eq('id', sessionId)
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  if (session.status === 'DONE') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { data: room } = await supabase
    .from('rooms')
    .select('keyword, creator_name, partner_name')
    .eq('id', session.room_id)
    .single()

  if (!room) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  // 유저 메시지 저장
  await supabase.from('messages').insert({
    session_id: sessionId,
    role: 'user',
    content,
    question_stage: session.current_question,
  })

  const partnerName = session.role === 'A' ? room.partner_name : room.creator_name
  const systemPrompt = buildSystemPrompt(
    room.keyword,
    session.participant_name,
    partnerName,
    session.current_question
  )
  const history = await buildMessageHistory(sessionId)

  // Claude 1번만 호출 (공감 멘트 생성 + tool 호출)
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 256, // 공감 한 줄만 생성하므로 토큰 절감 → 빠른 응답
    system: systemPrompt,
    messages: history,
    tools: [MARK_QUESTION_SATISFIED_TOOL],
  })

  let empathyText = ''
  let toolUseData: { question: number; summary: string } | null = null

  for (const block of msg.content) {
    if (block.type === 'text') {
      empathyText += block.text
    }
    if (block.type === 'tool_use' && block.name === 'mark_question_satisfied') {
      toolUseData = block.input as { question: number; summary: string }
    }
  }

  let nextQuestion: number | null = null
  let finalText = empathyText

  if (toolUseData) {
    const qKey = `q${toolUseData.question}_summary`
    nextQuestion = Math.min(toolUseData.question + 1, 5)

    await supabase
      .from('sessions')
      .update({ [qKey]: toolUseData.summary, current_question: nextQuestion })
      .eq('id', sessionId)

    // 다음 질문은 PRD 고정 텍스트 사용 (Claude 2번 호출 불필요)
    const nextQuestionText = PRD_QUESTIONS[nextQuestion]
    if (nextQuestionText) {
      finalText = empathyText
        ? `${empathyText.trim()}\n\n${nextQuestionText}`
        : nextQuestionText
    }
  }

  // AI 응답 저장
  if (finalText) {
    await supabase.from('messages').insert({
      session_id: sessionId,
      role: 'ai',
      content: finalText,
      question_stage: session.current_question,
    })
  }

  return NextResponse.json({
    text: finalText,
    questionAdvance: nextQuestion,
  })
}
