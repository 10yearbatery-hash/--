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
    .select('id, room_id, status, current_question')
    .eq('id', sessionId)
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('id, role, content, question_stage, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    messages: messages || [],
    currentQuestion: session.current_question,
    sessionDone: session.status === 'DONE',
  })
}
