import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  anthropic,
  buildSystemPrompt,
  buildMessageHistory,
  MARK_QUESTION_SATISFIED_TOOL,
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

  // 스트리밍 대신 일반 API 호출 (안정성 향상)
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: history,
    tools: [MARK_QUESTION_SATISFIED_TOOL],
  })

  // 텍스트 추출
  let aiText = ''
  let toolUseData: { question: number; summary: string } | null = null

  for (const block of msg.content) {
    if (block.type === 'text') {
      aiText += block.text
    }
    if (block.type === 'tool_use' && block.name === 'mark_question_satisfied') {
      toolUseData = block.input as { question: number; summary: string }
    }
  }

  // AI 메시지 저장
  if (aiText) {
    await supabase.from('messages').insert({
      session_id: sessionId,
      role: 'ai',
      content: aiText,
      question_stage: session.current_question,
    })
  }

  // 질문 충족 처리 및 다음 질문 생성
  let nextQuestion: number | null = null
  let nextAiText = ''

  if (toolUseData) {
    const qKey = `q${toolUseData.question}_summary`
    nextQuestion = Math.min(toolUseData.question + 1, 5)

    await supabase
      .from('sessions')
      .update({ [qKey]: toolUseData.summary, current_question: nextQuestion })
      .eq('id', sessionId)

    // 다음 질문이 있으면 즉시 AI에게 다음 질문 생성 요청
    if (nextQuestion <= 4) {
      const updatedHistory = await buildMessageHistory(sessionId)
      const nextSystemPrompt = buildSystemPrompt(
        room.keyword,
        session.participant_name,
        partnerName,
        nextQuestion
      )
      const nextMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 512,
        system: nextSystemPrompt,
        messages: updatedHistory,
      })
      for (const block of nextMsg.content) {
        if (block.type === 'text') nextAiText += block.text
      }
      if (nextAiText) {
        await supabase.from('messages').insert({
          session_id: sessionId,
          role: 'ai',
          content: nextAiText,
          question_stage: nextQuestion,
        })
      }
    }
  }

  return NextResponse.json({
    text: aiText || nextAiText,
    questionAdvance: nextQuestion,
  })
}
