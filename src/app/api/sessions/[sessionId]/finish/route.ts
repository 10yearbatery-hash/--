import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const sessionToken = req.headers.get('x-session-token')

  if (!sessionToken) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('id, room_id, status, session_token')
    .eq('id', sessionId)
    .eq('session_token', sessionToken)
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
  if (session.status === 'DONE') {
    return NextResponse.json({ error: 'CONFLICT', message: '이미 완료된 세션입니다.' }, { status: 409 })
  }

  await supabase
    .from('sessions')
    .update({ status: 'DONE', completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  // DB 트리거가 room.status를 자동 업데이트함
  await new Promise((resolve) => setTimeout(resolve, 300))

  const { data: room } = await supabase
    .from('rooms')
    .select('status')
    .eq('id', session.room_id)
    .single()

  // BOTH_DONE이면 결과 생성 시작 (비동기, fire-and-forget)
  if (room?.status === 'BOTH_DONE') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/rooms/${session.room_id}/result`, { method: 'POST' })
      .catch((err) => console.error('결과 생성 트리거 실패:', err))
  }

  return NextResponse.json({ status: 'DONE', roomStatus: room?.status })
}
