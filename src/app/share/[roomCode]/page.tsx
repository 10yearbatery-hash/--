'use client'
import { Suspense, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

function SharePageInner() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId') || ''
  const roomId = searchParams.get('roomId') || ''
  const [copied, setCopied] = useState(false)

  const shareLink = `${window.location.origin}/join/${roomCode}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('input')
      el.value = shareLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleEnter() {
    router.push(`/chat/${sessionId}?roomCode=${roomCode}&roomId=${roomId}`)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="연인에게 공유하기" showBack />

      <div className="flex-1 px-5 py-6 flex flex-col gap-5">
        <Card variant="pink">
          <p className="text-sm text-[#666]">아래 코드를 연인에게 공유해주세요</p>
          <p className="text-xs text-[#FF6B9D] mt-1">연인이 홈 화면에서 코드를 입력하면 입장할 수 있어요</p>
        </Card>

        {/* 방 코드 */}
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-sm text-[#666]">방 코드</p>
          <p className="text-4xl font-bold tracking-[0.3em] text-[#1A1A1A] font-mono">
            {roomCode}
          </p>
        </div>

        {/* 링크 복사 */}
        <Card className="bg-[#FFF5F8]">
          <p className="text-xs text-[#666] mb-2">또는 링크로 공유하기</p>
          <div className="flex gap-2 items-center">
            <p className="flex-1 text-xs text-[#999] truncate">{shareLink}</p>
            <button
              onClick={handleCopy}
              className="text-xs text-[#FF6B9D] font-semibold border border-[#FF6B9D] rounded-full px-3 py-1 flex-shrink-0"
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          </div>
        </Card>
      </div>

      <div className="px-5 pb-10 flex flex-col gap-3">
        <Button onClick={handleEnter}>
          나도 채팅방 입장하기
        </Button>
      </div>
    </main>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#FF6B9D] text-sm">로딩 중...</p>
      </div>
    }>
      <SharePageInner />
    </Suspense>
  )
}
