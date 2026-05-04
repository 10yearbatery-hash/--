import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const sessionToken = req.headers.get('x-session-token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // 세션 검증
  const { data: session } = await supabase
    .from('sessions')
    .select('id, room_id, status, current_question, role, participant_name')
    .eq('id', sessionId)
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const [{ data: messages }, { data: room }] = await Promise.all([
    supabase
      .from('messages')
      .select('id, role, content, question_stage, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('rooms')
      .select('creator_name, partner_name')
      .eq('id', session.room_id)
      .maybeSingle(),
  ])

  const partnerName = session.role === 'A' ? (room?.partner_name ?? '') : (room?.creator_name ?? '')

  return NextResponse.json({
    messages: messages || [],
    currentQuestion: session.current_question,
    sessionDone: session.status === 'DONE',
    sessionRole: session.role as 'A' | 'B',
    participantName: session.participant_name ?? '',
    partnerName,
  })
}
