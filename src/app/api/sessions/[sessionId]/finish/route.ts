import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateResult } from '@/lib/claude/result'

export const maxDuration = 60

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

  // DB 트리거가 room.status 자동 업데이트 (약간 대기)
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { data: room } = await supabase
    .from('rooms')
    .select('status, keyword, creator_name, partner_name')
    .eq('id', session.room_id)
    .single()

  // BOTH_DONE이면 결과 생성 직접 실행 (HTTP 자기호출 제거)
  if (room?.status === 'BOTH_DONE') {
    try {
      // GENERATING으로 먼저 업데이트
      await supabase
        .from('rooms')
        .update({ status: 'GENERATING' })
        .eq('id', session.room_id)

      // 양측 세션 데이터 조회
      const { data: sessions } = await supabase
        .from('sessions')
        .select('role, q1_summary, q2_summary, q3_summary, q4_summary')
        .eq('room_id', session.room_id)

      const sA = sessions?.find((s) => s.role === 'A')
      const sB = sessions?.find((s) => s.role === 'B')

      // Claude API로 결과 생성
      const result = await generateResult(
        room.keyword,
        room.creator_name,
        room.partner_name,
        { q1: sA?.q1_summary || '', q2: sA?.q2_summary || '', q3: sA?.q3_summary || '', q4: sA?.q4_summary || '' },
        { q1: sB?.q1_summary || '', q2: sB?.q2_summary || '', q3: sB?.q3_summary || '', q4: sB?.q4_summary || '' }
      )

      // 결과 저장
      await supabase.from('results').insert({
        room_id: session.room_id,
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

      // RESULT_READY → Realtime으로 양측에 전파
      await supabase
        .from('rooms')
        .update({ status: 'RESULT_READY' })
        .eq('id', session.room_id)

      return NextResponse.json({ status: 'DONE', roomStatus: 'RESULT_READY' })
    } catch (err) {
      console.error('결과 생성 실패:', err)
      await supabase.from('rooms').update({ status: 'BOTH_DONE' }).eq('id', session.room_id)
    }
  }

  return NextResponse.json({ status: 'DONE', roomStatus: room?.status })
}
