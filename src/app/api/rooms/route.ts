import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateRoomCode } from '@/lib/utils/room-code'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { keyword, creatorName, partnerName } = body

  if (!keyword || !creatorName || !partnerName) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: '필수 항목을 입력해주세요.' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  // 6자리 고유 코드 발급 (충돌 시 재시도)
  let code = ''
  for (let i = 0; i < 5; i++) {
    code = generateRoomCode()
    const { data } = await supabase.from('rooms').select('id').eq('code', code).maybeSingle()
    if (!data) break
  }

  // 방 생성
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ code, keyword, creator_name: creatorName, partner_name: partnerName })
    .select()
    .single()

  if (roomError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '방 생성에 실패했습니다.' },
      { status: 500 }
    )
  }

  // A 세션 생성
  const sessionToken = randomUUID()
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      room_id: room.id,
      role: 'A',
      participant_name: creatorName,
      session_token: sessionToken,
    })
    .select()
    .single()

  if (sessionError) {
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '세션 생성에 실패했습니다.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    roomId: room.id,
    roomCode: code,
    sessionToken,
    sessionId: session.id,
  })
}
