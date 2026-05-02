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
    <div className="min-h-screen bg-bp-bg flex flex-col max-w-[390px] mx-auto relative overflow-hidden">
      <Header
        rightSlot={
          <button
            className="border border-bborder bg-white rounded-full px-4 py-1.5 text-[15px] font-jua text-bd"
            onClick={() => router.push('/login')}
          >
            로그인
          </button>
        }
      />

      {/* 플로팅 하트 */}
      <div className="absolute left-12 top-[214px] opacity-50 animate-float-slower pointer-events-none">
        <span className="text-[#FFB3C1] text-[16px]">♥</span>
      </div>
      <div className="absolute left-[68px] top-[180px] opacity-50 animate-float pointer-events-none">
        <span className="text-bp text-[10px]">♥</span>
      </div>
      <div className="absolute right-[90px] top-[197px] opacity-50 animate-float-slow pointer-events-none">
        <span className="text-[#FFB3C1] text-[13px]">♥</span>
      </div>
      <div className="absolute right-[34px] top-[169px] opacity-50 animate-float pointer-events-none">
        <span className="text-bp text-[9px]">♥</span>
      </div>
      <div className="absolute right-[12px] top-[234px] opacity-50 animate-float-slower pointer-events-none">
        <span className="text-[#FFB3C1] text-[14px]">♥</span>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 -mt-8">
        {/* 로고 캐릭터 */}
        <div className="relative w-[163px] h-[110px]">
          <div className="absolute left-0 top-2 w-[90px] h-[90px] rounded-full bg-[#F9C8D4] flex items-center justify-center">
            <span className="text-bd text-2xl select-none">·ᴗ·</span>
          </div>
          <div className="absolute right-0 top-2 w-[90px] h-[90px] rounded-full bg-bp flex items-center justify-center">
            <span className="text-white text-2xl select-none">·ˢ·</span>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <span className="text-white text-xl drop-shadow">♥</span>
          </div>
        </div>

        <h1 className="font-jua text-[42px] text-bd mt-3 leading-none">본심</h1>
        <p className="font-jua text-[18px] text-bp mt-1">Von &amp; Sim</p>

        <div className="relative mt-5 flex justify-center">
          <div className="absolute inset-0 bg-white rounded-full blur-[7px] scale-110" />
          <p className="relative text-[15px] font-jua text-bm text-center px-6 py-1">
            승패가 아닌, 관계의 회복
          </p>
        </div>
      </main>

      {/* 하단 CTA */}
      <div className="px-5 pb-10 space-y-4 relative z-10">
        <Button onClick={() => router.push('/room/create')}>
          <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <line x1="9" y1="2" x2="9" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="2" y1="9" x2="16" y2="9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          방 만들기
        </Button>

        {!showCodeInput ? (
          <div className="flex justify-center">
            <button
              className="text-[16px] font-jua text-bm underline underline-offset-2"
              onClick={() => setShowCodeInput(true)}
            >
              코드 입력하기
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-bborder rounded-full px-4 py-2 text-center text-lg font-mono tracking-widest uppercase bg-white focus:outline-none focus:border-bp"
              placeholder="6자리 코드"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCodeJoin() }}
              autoFocus
            />
            <Button fullWidth={false} className="px-5 text-base h-11 rounded-full" onClick={handleCodeJoin} disabled={code.length !== 6}>
              입장
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
