import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const profileId = req.headers.get('x-profile-id')

  if (!profileId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('promises')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ promises: data || [] })
}

export async function POST(req: NextRequest) {
  const profileId = req.headers.get('x-profile-id')

  if (!profileId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { roomId, promises } = await req.json()

  if (!promises?.length) {
    return NextResponse.json({ error: 'INVALID_INPUT', message: '저장할 약속이 없습니다.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const rows = (promises as Array<{ content: string; isCustom: boolean }>).map((p) => ({
    profile_id: profileId,
    room_id: roomId || null,
    content: p.content,
    is_custom: p.isCustom,
  }))

  const { error } = await supabase.from('promises').insert(rows)

  if (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: '저장에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ saved: rows.length })
}
