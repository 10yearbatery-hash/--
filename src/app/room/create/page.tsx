'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Header from '@/components/ui/Header'
import { setSessionToken } from '@/lib/utils/session-token'

interface FieldProps {
  label: string
  avatarSrc: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function Field({ label, avatarSrc, value, onChange, placeholder = '이름을 입력하세요' }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-jua text-[13px] text-[#a0a0b8]">{label}</span>
      <div className={`flex items-center gap-2 bg-white rounded-[12px] px-3 py-2.5 border transition-all ${
        value ? 'border-[#ff6b9d]' : 'border-[#F0D0DC]'
      }`}>
        <img src={avatarSrc} alt={label} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        <input
          className="flex-1 text-[15px] text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#a0a0b8] font-light"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <span className="text-[#ff6b9d] text-sm flex-shrink-0">✓</span>
        )}
      </div>
    </div>
  )
}

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
    <main className="min-h-dvh flex flex-col bg-white">
      <Header
        title="방 만들기"
        showBack
        progress={0.25}
        rightSlot={
          <button
            className="border border-[#F0D0DC] bg-white rounded-full px-3 py-1 font-jua text-[13px] text-[#1a1a2e]"
            onClick={() => router.push('/login')}
          >
            로그인
          </button>
        }
      />

      <div className="flex-1 px-5 py-5 flex flex-col gap-6">
        {/* 안내 카드 */}
        <div className="bg-[#fff5f7] rounded-[15px] px-4 py-4 flex gap-3 items-center">
          <img src="/characters.png" alt="본심 캐릭터" className="w-[52px] h-[52px] object-contain flex-shrink-0" />
          <div>
            <p className="font-jua text-[20px] text-[#1a1a2e] leading-tight">대화를 시작해요</p>
            <p className="font-jua text-[13px] text-[#a0a0b8] mt-0.5">
              두 분의 이름과 갈등 키워드를 알려주세요
            </p>
          </div>
        </div>

        {/* 섹션 1: 두 분의 이름 */}
        <div>
          <h2 className="font-jua text-[20px] text-[#ff6b8a] mb-3">두 분의 이름</h2>
          <div className="bg-[#f8f8fa] rounded-[15px] px-4 py-4 flex flex-col gap-4">
            <Field
              label="내 이름"
              avatarSrc="/bonny.png"
              value={myName}
              onChange={setMyName}
              placeholder="이름을 입력하세요"
            />
            <Field
              label="상대방 이름"
              avatarSrc="/simmy.png"
              value={partnerName}
              onChange={setPartnerName}
              placeholder="이름을 입력하세요"
            />
          </div>
        </div>

        {/* 섹션 2: 갈등의 핵심 */}
        <div>
          <h2 className="font-jua text-[20px] text-[#ff6b8a] mb-3">갈등의 핵심</h2>
          <div className="bg-[#f8f8fa] rounded-[15px] px-4 py-4 flex flex-col gap-1">
            <span className="font-jua text-[13px] text-[#a0a0b8]">갈등 키워드</span>
            <div className={`flex items-center bg-white rounded-[12px] px-3 py-2.5 border transition-all ${
              keyword ? 'border-[#ff6b9d]' : 'border-[#F0D0DC]'
            }`}>
              <input
                className="flex-1 text-[15px] text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#a0a0b8] font-light"
                placeholder="ex. 연락 빈도, 약속 시간, 질투 등"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && <span className="text-[#ff6b9d] text-sm flex-shrink-0">✓</span>}
            </div>
          </div>
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
    </main>
  )
}
