'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/promises'
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email) return
    setLoading(true)
    const supabase = createClient()
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })
    setLoading(false)
    if (error) {
      alert('로그인 요청에 실패했습니다. 다시 시도해주세요.')
      return
    }
    setSent(true)
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header title="로그인" showBack />
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6">
        {!sent ? (
          <>
            <div className="text-center">
              <p className="text-lg font-bold text-[#1A1A1A]">약속을 안전하게 저장해요</p>
              <p className="text-sm text-[#666] mt-2 leading-relaxed">
                이메일로 로그인 링크를 보내드릴게요.<br />
                비밀번호 없이 간편하게 로그인할 수 있어요.
              </p>
            </div>
            <input
              className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 focus:outline-none focus:border-[#FF6B9D] text-sm"
              type="email"
              placeholder="이메일 주소를 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
            />
            <Button onClick={handleLogin} disabled={!email || loading}>
              {loading ? '발송 중...' : '로그인 링크 받기'}
            </Button>
          </>
        ) : (
          <div className="text-center flex flex-col items-center gap-4">
            <span className="text-5xl">📧</span>
            <p className="text-lg font-bold text-[#1A1A1A]">이메일을 확인해주세요</p>
            <p className="text-sm text-[#666] leading-relaxed">
              <span className="text-[#FF6B9D] font-medium">{email}</span>로<br />
              로그인 링크를 보냈어요.
            </p>
            <button
              className="text-sm text-[#999] underline mt-2"
              onClick={() => { setSent(false); setEmail('') }}
            >
              다른 이메일로 다시 시도
            </button>
          </div>
        )}
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
