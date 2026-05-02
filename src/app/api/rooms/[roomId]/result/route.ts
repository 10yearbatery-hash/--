import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateResult } from '@/lib/claude/result'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = createServiceClient()

  // 중복 실행 방지: BOTH_DONE인 경우만 처리
  const { data: room } = await supabase
    .from('rooms')
    .select('status, keyword, creator_name, partner_name')
    .eq('id', roomId)
    .single()

  if (!room || room.status !== 'BOTH_DONE') {
    return NextResponse.json({ error: 'FORBIDDEN', message: '아직 양측 대화가 완료되지 않았습니다.' }, { status: 403 })
  }

  // GENERATING으로 먼저 업데이트 (중복 방지)
  const { error: updateError } = await supabase
    .from('rooms')
    .update({ status: 'GENERATING' })
    .eq('id', roomId)
    .eq('status', 'BOTH_DONE')  // 동시 호출 방지

  if (updateError) {
    return NextResponse.json({ error: 'CONFLICT', message: '이미 결과 생성 중입니다.' }, { status: 409 })
  }

  // 세션 데이터 조회
  const { data: sessions } = await supabase
    .from('sessions')
    .select('role, q1_summary, q2_summary, q3_summary, q4_summary')
    .eq('room_id', roomId)

  const sA = sessions?.find((s) => s.role === 'A')
  const sB = sessions?.find((s) => s.role === 'B')

  try {
    const result = await generateResult(
      room.keyword,
      room.creator_name,
      room.partner_name,
      {
        q1: sA?.q1_summary || '',
        q2: sA?.q2_summary || '',
        q3: sA?.q3_summary || '',
        q4: sA?.q4_summary || '',
      },
      {
        q1: sB?.q1_summary || '',
        q2: sB?.q2_summary || '',
        q3: sB?.q3_summary || '',
        q4: sB?.q4_summary || '',
      }
    )

    // 결과 저장
    await supabase.from('results').insert({
      room_id: roomId,
      situation_summary: result.situation.summary,
      situation_highlight: result.situation.highlight,
      truth_a_hurt: result.truths.a.hurt,
      truth_a_need: result.truths.a.need,
      truth_a_understanding: result.truths.a.understanding,
      truth_b_hurt: result.truths.b.hurt,
      truth_b_need: result.truths.b.need,
      truth_b_understanding: result.truths.b.understanding,
      translation_body: result.translation.body,
      translation_highlight: result.translation.highlight,
      recommended_promises: result.promises,
    })

    // RESULT_READY로 업데이트 → Realtime으로 A, B에 전파
    await supabase.from('rooms').update({ status: 'RESULT_READY' }).eq('id', roomId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    // 실패 시 BOTH_DONE으로 롤백
    await supabase.from('rooms').update({ status: 'BOTH_DONE' }).eq('id', roomId)
    console.error('결과 생성 실패:', err)
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: '결과 생성에 실패했습니다.' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const sessionToken = req.headers.get('x-session-token')
  const supabase = createServiceClient()

  // 참여자 검증
  const { data: session } = await supabase
    .from('sessions')
    .select('role, participant_name')
    .eq('room_id', roomId)
    .eq('session_token', sessionToken || '')
    .maybeSingle()

  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { data: result } = await supabase
    .from('results')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle()

  if (!result) {
    return NextResponse.json({ error: 'NOT_FOUND', message: '아직 결과가 생성되지 않았습니다.' }, { status: 404 })
  }

  const { data: room } = await supabase
    .from('rooms')
    .select('creator_name, partner_name')
    .eq('id', roomId)
    .single()

  return NextResponse.json({
    ...result,
    creatorName: room?.creator_name,
    partnerName: room?.partner_name,
  })
}
