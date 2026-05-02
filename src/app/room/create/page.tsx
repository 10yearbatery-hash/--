'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
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

  const inputBase = "w-full border-2 rounded-2xl px-4 py-3 bg-bp-input focus:outline-none text-bd text-[15px] placeholder:text-bc transition-colors"

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      <Header
        title="방 만들기"
        showBack
        rightSlot={
          <button className="border border-bborder bg-white rounded-full px-3 py-1 text-[13px] font-jua text-bd">
            로그인
          </button>
        }
      />

      {/* 핑크 진행바 */}
      <div className="h-[3px] bg-gradient-pink" style={{ width: '40%' }} />

      <div className="flex-1 px-5 py-6 flex flex-col gap-6">
        {/* 안내 카드 */}
        <div className="bg-bp-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bp-light flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <p className="font-jua text-[17px] text-bd">대화를 시작해요</p>
            <p className="text-[13px] text-bm mt-0.5">두 분의 이름과 갈등 키워드를 알려주세요</p>
          </div>
        </div>

        {/* 이름 입력 */}
        <div className="flex flex-col gap-3">
          <p className="font-jua text-[16px] text-bp">두 분의 이름</p>
          {/* 내 이름 */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F9C8D4] flex items-center justify-center z-10">
              <span className="text-bd text-xs">·ᴗ·</span>
            </div>
            <input
              className={`${inputBase} pl-14 ${myName ? 'border-bp' : 'border-bborder'}`}
              placeholder="내 이름"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
            />
            {myName && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bp text-lg">✓</span>
            )}
          </div>
          {/* 상대방 이름 */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bp flex items-center justify-center z-10">
              <span className="text-white text-xs">·ˢ·</span>
            </div>
            <input
              className={`${inputBase} pl-14 ${partnerName ? 'border-bp' : 'border-bborder'}`}
              placeholder="이름을 입력하세요"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            />
            {partnerName && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bp text-lg">✓</span>
            )}
          </div>
        </div>

        {/* 갈등 키워드 */}
        <div className="flex flex-col gap-3">
          <p className="font-jua text-[16px] text-bp">갈등의 핵심</p>
          <input
            className={`${inputBase} ${keyword ? 'border-bp' : 'border-bborder'}`}
            placeholder="ex. 연락 빈도, 약속 시간, 질투 등"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="px-5 pb-10">
        <Button
          onClick={handleSubmit}
          disabled={!myName || !partnerName || !keyword || loading}
        >
          {loading ? '생성 중...' : '입력 완료 / 코드 생성'}
        </Button>
      </div>
    </div>
  )
}
