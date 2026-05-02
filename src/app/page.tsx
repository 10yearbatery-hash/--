'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Header from '@/components/ui/Header'

export default function HomePage() {
  const router = useRouter()
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [code, setCode] = useState('')

  function handleCodeJoin() {
    if (code.length !== 6) return
    router.push(`/join/${code.toUpperCase()}`)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        rightSlot={
          <button
            className="text-sm text-[#FF6B9D] font-medium border border-[#FF6B9D] rounded-full px-3 py-1"
            onClick={() => router.push('/login')}
          >
            로그인
          </button>
        }
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-8">
        {/* 로고 */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-12">
            <div className="absolute left-0 w-12 h-12 rounded-full bg-[#FF6B9D] opacity-90" />
            <div className="absolute right-0 w-12 h-12 rounded-full bg-[#FFD6E7]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">본심</h1>
          <p className="text-sm text-[#FF6B9D] font-medium tracking-widest">Bon-Sim</p>
          <div className="text-center mt-2">
            <p className="text-[#666] text-sm leading-relaxed">
              비난 뒤에 숨겨진<br />진심을 함께 찾아요
            </p>
            <p className="text-xs text-[#FF6B9D] mt-2 font-medium">슬픔이 아닌, 관계의 회복</p>
          </div>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="px-5 pb-12 flex flex-col gap-3">
        <Button onClick={() => router.push('/room/create')}>
          ❤ 방 만들기
        </Button>

        {!showCodeInput ? (
          <button
            className="text-center text-sm text-[#FF6B9D] py-2"
            onClick={() => setShowCodeInput(true)}
          >
            → 코드 입력하기
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-[#F0D0DC] rounded-full px-4 py-2 text-center text-lg font-mono tracking-widest uppercase bg-white focus:outline-none focus:border-[#FF6B9D]"
              placeholder="6자리 코드"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCodeJoin() }}
              autoFocus
            />
            <Button
              fullWidth={false}
              className="px-5"
              onClick={handleCodeJoin}
              disabled={code.length !== 6}
            >
              입장
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
