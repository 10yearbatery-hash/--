'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Header from '@/components/ui/Header'
import { setSessionToken } from '@/lib/utils/session-token'

interface RoomInfo {
  roomId: string
  keyword: string
  creatorName: string
  partnerName: string
}

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/rooms/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.message); return }
        setRoomInfo({
          roomId: data.roomId,
          keyword: data.keyword,
          creatorName: data.creatorName,
          partnerName: data.partnerName,
        })
      })
  }, [code])

  async function handleJoin() {
    if (!roomInfo) return
    setLoading(true)
    const res = await fetch(`/api/rooms/${roomInfo.roomId}/join`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { alert(data.message); setLoading(false); return }
    setSessionToken(data.sessionToken)
    router.push(`/chat/${data.sessionId}?roomCode=${code}&roomId=${roomInfo.roomId}`)
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-[#666] text-center">{error}</p>
        <button className="text-[#FF6B9D] text-sm" onClick={() => router.push('/')}>홈으로 돌아가기</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="채팅방 입장" showBack />

      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        {roomInfo ? (
          <>
            <Card variant="pink">
              <p className="text-sm text-[#666]">
                <span className="font-semibold text-[#FF6B9D]">{roomInfo.creatorName}</span>님이 대화를 요청했어요
              </p>
              <p className="font-semibold text-[#1A1A1A] mt-2">
                갈등 키워드: <span className="text-[#FF6B9D]">{roomInfo.keyword}</span>
              </p>
            </Card>
            <Card>
              <p className="text-sm text-[#666]">
                입장하면 AI 상담사와 1:1 대화를 진행합니다.<br />
                상대방의 대화 내용은 볼 수 없어요.
              </p>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-[#666] text-sm">방 정보를 불러오는 중...</p>
          </div>
        )}
      </div>

      <div className="px-5 pb-10">
        <Button onClick={handleJoin} disabled={!roomInfo || loading}>
          {loading ? '입장 중...' : '채팅방 입장하기'}
        </Button>
      </div>
    </main>
  )
}
