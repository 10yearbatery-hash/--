'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Header from '@/components/ui/Header'
import { setSessionToken } from '@/lib/utils/session-token'

export default function RoomCreatePage() {
  const router = useRouter()
  const [myName, setMyName] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!myName || !partnerName || !keyword) return
    setLoading(true)
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, creatorName: myName, partnerName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSessionToken(data.sessionToken)
      router.push(`/share/${data.roomCode}?sessionId=${data.sessionId}&roomId=${data.roomId}`)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '방 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="방 만들기" showBack />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">
        <Card variant="pink">
          <p className="font-semibold text-[#FF6B9D]">❤ 대화를 시작해요</p>
          <p className="text-sm text-[#666] mt-1">두 분의 이름과 갈등 키워드를 알려주세요</p>
        </Card>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-[#1A1A1A]">👤 두 분의 이름</label>
          <input
            className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D] text-sm"
            placeholder="😊 내 이름 (예: 지민)"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
          />
          <input
            className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D] text-sm"
            placeholder="🥰 상대방 이름 (예: 수현)"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#1A1A1A]">💬 갈등의 핵심</label>
          <input
            className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D] text-sm"
            placeholder="💭 예: 연락 빈도, 약속 시간, 질투"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <p className="text-xs text-[#FF6B9D]">⚠ 키워드가 구체적일수록 더 정확한 도움을 받을 수 있어요</p>
        </div>
      </div>

      <div className="px-5 pb-10">
        <Button
          onClick={handleSubmit}
          disabled={!myName || !partnerName || !keyword || loading}
        >
          {loading ? '생성 중...' : '입력 완료 / 코드 생성 →'}
        </Button>
      </div>
    </main>
  )
}
