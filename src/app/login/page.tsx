'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import Button from '@/components/ui/Button'
import { setProfileId } from '@/lib/utils/session-token'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/promises'
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!name.trim() || pin.length !== 4) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), pin }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || '로그인에 실패했습니다.'); return }
      setProfileId(data.profileId, data.name)
      router.push(redirect)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="로그인" showBack />
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        <div className="text-center">
          <p className="text-lg font-bold text-[#1A1A1A]">약속을 저장해요</p>
          <p className="text-sm text-[#666] mt-2">이름과 4자리 숫자를 입력하면 바로 로그인돼요</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <input
            className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 text-sm bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D]"
            placeholder="이름 (예: 지민)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 text-sm bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D] text-center tracking-[0.5em] text-lg font-mono"
            placeholder="4자리 숫자"
            type="number"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const v = e.target.value.slice(0, 4)
              setPin(v)
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          onClick={handleLogin}
          disabled={!name.trim() || pin.length !== 4 || loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <p className="text-xs text-[#999] text-center">
          같은 이름과 숫자로 다시 접속하면 내 약속을 볼 수 있어요
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-[#FF6B9D] text-sm">로딩 중...</p></div>}>
      <LoginPageInner />
    </Suspense>
  )
}
