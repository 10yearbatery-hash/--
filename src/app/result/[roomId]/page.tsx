'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import ProgressSteps from '@/components/ui/ProgressSteps'
import Button from '@/components/ui/Button'
import StepSituation from '@/components/result/StepSituation'
import StepTruths from '@/components/result/StepTruths'
import StepTranslation from '@/components/result/StepTranslation'
import StepPromises from '@/components/result/StepPromises'
import { getSessionToken, getProfileId } from '@/lib/utils/session-token'
import type { ResultData } from '@/types'

const STEP_TITLES = ['상황 요약', '서로의 진심', 'VonSim 통역', '앞으로의 약속']
const STEP_SUBTITLES = [
  '무슨 일이 있었나요?',
  '서로의 속마음을 확인해요',
  '본심으로 번역해드릴게요',
  '함께 지켜나가기로 약속해요',
]

interface ResultPageData extends ResultData {
  creatorName: string
  partnerName: string
}

function ResultPageInner() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()
  const [result, setResult] = useState<ResultPageData | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionToken = getSessionToken()
    fetch(`/api/rooms/${roomId}/result`, {
      headers: { 'x-session-token': sessionToken || '' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.message || '결과를 불러올 수 없어요.'); return }
        setResult(data)
        setLoading(false)
      })
      .catch(() => setError('네트워크 오류가 발생했습니다.'))
  }, [roomId])

  async function handleSave(selected: string[], custom: string[]) {
    const profileId = getProfileId()
    const promises = [
      ...selected.map((c) => ({ content: c, isCustom: false })),
      ...custom.map((c) => ({ content: c, isCustom: true })),
    ]

    // 비로그인 시 약속 데이터를 sessionStorage에 보관 후 로그인으로 이동
    if (!profileId) {
      sessionStorage.setItem('pendingPromises', JSON.stringify({ roomId, promises }))
      router.push('/login?redirect=/promises')
      return
    }

    setSaveLoading(true)
    const res = await fetch('/api/promises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-profile-id': profileId },
      body: JSON.stringify({ roomId, promises }),
    })
    setSaveLoading(false)

    if (res.ok) {
      router.push('/promises')
    } else {
      alert('저장에 실패했습니다.')
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-[#a0a0b8] text-center">{error}</p>
        <button className="text-[#ff6b9d] font-jua text-sm" onClick={() => router.push('/')}>홈으로</button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-jua text-[#ff6b9d] text-sm">결과를 불러오는 중...</p>
      </main>
    )
  }

  if (!result) return null

  return (
    <main className="min-h-dvh flex flex-col bg-white">
      <Header
        title={STEP_TITLES[step - 1]}
        subtitle={STEP_SUBTITLES[step - 1]}
        showBack
        onBack={step > 1 ? () => setStep((s) => s - 1) : () => router.back()}
        rightSlot={
          <button
            className="border border-[#F0D0DC] bg-white rounded-full px-3 py-1 font-jua text-[13px] text-[#1a1a2e]"
            onClick={() => router.push('/login')}
          >
            로그인
          </button>
        }
      />

      <ProgressSteps current={step} showActiveLabel />

      {/* 콘텐츠 */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {step === 1 && (
          <StepSituation
            summary={result.situation_summary}
            highlight={result.situation_highlight}
          />
        )}
        {step === 2 && (
          <StepTruths
            creatorName={result.creatorName}
            partnerName={result.partnerName}
            truthA={{
              hurt: result.truth_a_hurt,
              need: result.truth_a_need,
              understanding: result.truth_a_understanding,
            }}
            truthB={{
              hurt: result.truth_b_hurt,
              need: result.truth_b_need,
              understanding: result.truth_b_understanding,
            }}
          />
        )}
        {step === 3 && (
          <StepTranslation
            body={result.translation_body}
            highlight={result.translation_highlight}
          />
        )}
        {step === 4 && (
          <StepPromises
            promises={result.recommended_promises}
            onSave={handleSave}
            loading={saveLoading}
            creatorName={result.creatorName}
            partnerName={result.partnerName}
          />
        )}
      </div>

      {/* 다음 버튼 */}
      {step < 4 && (
        <div className="px-5 pb-10 pt-2">
          <Button onClick={() => setStep((s) => s + 1)}>
            <span>다음</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      )}
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-jua text-[#ff6b9d] text-sm">로딩 중...</p>
      </div>
    }>
      <ResultPageInner />
    </Suspense>
  )
}
