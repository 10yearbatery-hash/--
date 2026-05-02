import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { name, pin } = await req.json()

  if (!name || !pin || pin.length !== 4) {
    return NextResponse.json({ error: 'INVALID_INPUT', message: '이름과 4자리 PIN을 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 기존 프로필 찾기
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('name', name.trim())
    .eq('pin', pin)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ profileId: existing.id, name: existing.name })
  }

  // 없으면 새로 생성
  const { data: created, error } = await supabase
    .from('profiles')
    .insert({ name: name.trim(), pin })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: '로그인에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ profileId: created.id, name: created.name })
}
