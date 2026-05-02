import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = createServiceClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('partner_name')
    .eq('id', roomId)
    .maybeSingle()

  if (!room) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: '방을 찾을 수 없어요.' },
      { status: 404 }
    )
  }

  // B 세션이 이미 있으면 기존 것 반환
  const { data: existing } = await supabase
    .from('sessions')
    .select('id, session_token')
    .eq('room_id', roomId)
    .eq('role', 'B')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      sessionToken: existing.session_token,
      sessionId: existing.id,
    })
  }

  const sessionToken = randomUUID()
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      room_id: roomId,
      role: 'B',
      participant_name: room.partner_name,
      session_token: sessionToken,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '입장에 실패했습니다.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ sessionToken, sessionId: session.id })
}
