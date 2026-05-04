import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const supabase = createServiceClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('id, keyword, creator_name, partner_name, status, expires_at')
    .eq('code', roomId.toUpperCase())
    .maybeSingle()

  if (!room) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: '존재하지 않는 코드예요.' },
      { status: 404 }
    )
  }

  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: '만료된 방이에요.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    roomId: room.id,
    keyword: room.keyword,
    creatorName: room.creator_name,
    partnerName: room.partner_name,
    status: room.status,
  })
}
