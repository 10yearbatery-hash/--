'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const router = useRouter()
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [code, setCode] = useState('')

  function handleCodeJoin() {
    if (code.length !== 6) return
    router.push(`/join/${code.toUpperCase()}`)
  }

  return (
    <main className="min-h-screen bg-warm-white flex flex-col relative overflow-hidden">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 pt-12 pb-4 relative z-10">
        <button className="flex flex-col gap-[6px]" aria-label="메뉴">
          <span className="block w-[22px] h-[2.5px] rounded-full bg-text-muted" />
          <span className="block w-[22px] h-[2.5px] rounded-full bg-text-muted" />
          <span className="block w-[22px] h-[2.5px] rounded-full bg-text-muted" />
        </button>
        <button
          className="border border-border bg-white rounded-full px-4 py-1.5 text-[15px] font-jua text-text-dark"
          onClick={() => router.push('/login')}
        >
          로그인
        </button>
      </header>

      {/* 떠다니는 하트 장식 */}
      <div className="absolute left-12 top-[214px] opacity-50 animate-float-slower pointer-events-none">
        <span className="text-[#FFB3C1] text-[16px]">♥</span>
      </div>
      <div className="absolute left-[68px] top-[180px] opacity-50 animate-float pointer-events-none">
        <span className="text-primary text-[10px]">♥</span>
      </div>
      <div className="absolute right-[90px] top-[197px] opacity-50 animate-float-slow pointer-events-none">
        <span className="text-[#FFB3C1] text-[13px]">♥</span>
      </div>
      <div className="absolute right-[34px] top-[169px] opacity-50 animate-float pointer-events-none">
        <span className="text-primary text-[9px]">·</span>
      </div>
      <div className="absolute right-[12px] top-[234px] opacity-50 animate-float-slower pointer-events-none">
        <span className="text-[#FFB3C1] text-[14px]">♥</span>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 -mt-8">
        {/* 캐릭터 이미지 */}
        <img
          src="/characters.png"
          alt="본심 Von & Sim 캐릭터"
          className="w-[163px] h-[186px] object-contain"
        />

        {/* 태그라인 (blur pill) */}
        <div className="relative mt-4 flex justify-center">
          <div className="absolute inset-0 bg-white rounded-full blur-[7px] scale-110" />
          <p className="relative text-[16px] font-jua text-text-muted text-center px-6 py-1">
            승패가 아닌, 관계의 회복
          </p>
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="px-5 pb-10 space-y-4 relative z-10">
        <Button onClick={() => router.push('/room/create')}>
          <span className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <line x1="9" y1="2" x2="9" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="2" y1="9" x2="16" y2="9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          방 만들기
        </Button>

        {!showCodeInput ? (
          <div className="flex justify-center">
            <button
              className="text-[16px] font-jua text-text-muted underline underline-offset-2"
              onClick={() => setShowCodeInput(true)}
            >
              코드 입력하기
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-border rounded-full px-4 py-2 text-center text-lg font-mono tracking-widest uppercase bg-white focus:outline-none focus:border-primary"
              placeholder="6자리 코드"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCodeJoin() }}
              autoFocus
            />
            <button
              className="h-14 px-5 rounded-[18px] bg-gradient-to-r from-[#FF6B9D] to-[#FF8FB3] text-white font-jua text-lg disabled:opacity-50"
              onClick={handleCodeJoin}
              disabled={code.length !== 6}
            >
              입장
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
