'use client'
import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/ui/Header'
import ProgressSteps from '@/components/ui/ProgressSteps'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StepSituation from '@/components/result/StepSituation'
import StepTruths from '@/components/result/StepTruths'
import StepTranslation from '@/components/result/StepTranslation'
import StepPromises from '@/components/result/StepPromises'
import { getSessionToken } from '@/lib/utils/session-token'
import type { ResultData } from '@/types'

const STEP_TITLES = ['상황 요약', '서로의 진심', 'AI 갈등 통역', '앞으로의 약속']
const STEP_SUBTITLES = [
  '무슨 일이 있었나요?',
  '서로의 속마음을 확인해요',
  '본심으로 번역해드릴게요',
  '함께 지켜나갈 약속들',
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
  const [showModal, setShowModal] = useState(false)
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
    setSaveLoading(true)
    const sessionToken = getSessionToken()
    const promises = [
      ...selected.map((c) => ({ content: c, isCustom: false })),
      ...custom.map((c) => ({ content: c, isCustom: true })),
    ]

    const res = await fetch('/api/promises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': sessionToken || '',
      },
      body: JSON.stringify({ roomId, promises }),
    })

    setSaveLoading(false)

    if (res.status === 401) {
      router.push(`/login?redirect=${encodeURIComponent(`/result/${roomId}`)}`)
      return
    }

    if (res.ok) {
      setShowModal(true)
    } else {
      alert('저장에 실패했습니다.')
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-[#666] text-center">{error}</p>
        <button className="text-[#FF6B9D] text-sm" onClick={() => router.push('/')}>홈으로</button>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-[#FF6B9D] text-sm">결과를 불러오는 중...</p>
      </main>
    )
  }

  if (!result) return null

  return (
    <main className="min-h-screen flex flex-col bg-[#FFF5F8]">
      <Header
        title={STEP_TITLES[step - 1]}
        showBack={step > 1}
        rightSlot={
          <button
            className="text-xs text-[#FF6B9D] border border-[#FF6B9D] rounded-full px-2 py-1"
            onClick={() => router.push('/login')}
          >
            로그인
          </button>
        }
      />

      {/* 프로그레스 바 */}
      <ProgressSteps current={step} />

      {/* 서브타이틀 */}
      <p className="text-center text-xs text-[#666] -mt-2 mb-2">{STEP_SUBTITLES[step - 1]}</p>

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
          />
        )}
      </div>

      {/* 다음 버튼 */}
      {step < 4 && (
        <div className="px-5 pb-10">
          <Button onClick={() => setStep((s) => s + 1)}>다음 &gt;</Button>
        </div>
      )}

      {/* 저장 완료 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">💝</span>
          <h2 className="text-xl font-bold text-[#1A1A1A]">약속이 저장됐어요</h2>
          <p className="text-sm text-[#666] leading-relaxed">
            두 분의 소중한 약속이 기록됐어요.<br />
            로그인하면 언제든지 다시 볼 수 있어요.
          </p>
          <Button onClick={() => router.push('/')}>처음으로 돌아가기</Button>
          <button
            className="text-sm text-[#999]"
            onClick={() => setShowModal(false)}
          >
            닫기
          </button>
        </div>
      </Modal>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#FF6B9D] text-sm">로딩 중...</p>
      </div>
    }>
      <ResultPageInner />
    </Suspense>
  )
}
