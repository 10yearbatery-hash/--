import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  anthropic,
  buildSystemPrompt,
  buildMessageHistory,
  MARK_QUESTION_SATISFIED_TOOL,
} from '@/lib/claude/chat'

export const maxDuration = 60 // Vercel 함수 타임아웃 60초

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

  // 세션 조회 및 검증
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
    return NextResponse.json({ error: 'FORBIDDEN', message: '이미 완료된 세션입니다.' }, { status: 403 })
  }

  // 방 정보 조회
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

  const encoder = new TextEncoder()
  let fullText = ''
  let toolUseData: { question: number; summary: string } | null = null

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: history,
          tools: [MARK_QUESTION_SATISFIED_TOOL],
        })

        claudeStream.on('text', (text) => {
          fullText += text
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`)
          )
        })

        claudeStream.on('message', async (msg) => {
          // tool use 처리
          for (const block of msg.content) {
            if (block.type === 'tool_use' && block.name === 'mark_question_satisfied') {
              toolUseData = block.input as { question: number; summary: string }
            }
          }

          // AI 메시지 저장
          if (fullText) {
            await supabase.from('messages').insert({
              session_id: sessionId,
              role: 'ai',
              content: fullText,
              question_stage: session.current_question,
            })
          }

          // 질문 충족 처리
          if (toolUseData) {
            const qKey = `q${toolUseData.question}_summary`
            const nextQuestion = Math.min(toolUseData.question + 1, 5)
            await supabase
              .from('sessions')
              .update({
                [qKey]: toolUseData.summary,
                current_question: nextQuestion,
              })
              .eq('id', sessionId)

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'question_advance', question: nextQuestion })}\n\n`
              )
            )
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        })

        claudeStream.on('error', (err) => {
          console.error('Claude stream error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`)
          )
          controller.close()
        })
      } catch (err) {
        console.error('Stream start error:', err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
