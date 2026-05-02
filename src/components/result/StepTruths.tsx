'use client'
// 결과 2단계: 서로의 진심 컴포넌트 - 탭으로 A/B 전환

import { useState } from 'react'

interface Truth {
  hurt: string
  need: string
  understanding: string
}

interface Props {
  creatorName: string
  partnerName: string
  truthA: Truth
  truthB: Truth
}

export default function StepTruths({ creatorName, partnerName, truthA, truthB }: Props) {
  const [tab, setTab] = useState<'A' | 'B'>('A')
  const truth = tab === 'A' ? truthA : truthB
  const name = tab === 'A' ? creatorName : partnerName

  return (
    <div className="flex flex-col gap-4">
      <p className="font-jua text-[18px] text-bd">서로는 지금 이렇게 생각하고 있어요.</p>

      {/* 탭 버튼 */}
      <div className="flex gap-2">
        {(['A', 'B'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-bp text-white shadow-sm'
                : 'bg-bp-card text-bm'
            }`}
          >
            {t === 'A' ? creatorName : partnerName}의 입장
          </button>
        ))}
      </div>

      {/* 가장 속상했던 부분 */}
      <div className="bg-bp-card rounded-2xl p-4 border border-bborder">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-base">💗</span>
          <p className="text-xs text-bp font-semibold">가장 속상했던 부분</p>
        </div>
        <p className="text-[13px] text-bd leading-relaxed">{truth.hurt}</p>
      </div>

      {/* 정말로 바랐던 것 */}
      <div className="bg-bp-card rounded-2xl p-4 border border-bborder">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-base">💗</span>
          <p className="text-xs text-bp font-semibold">{name}가 정말로 바랐던 것</p>
        </div>
        <p className="text-[13px] text-bd leading-relaxed">{truth.need}</p>
      </div>

      {/* 상대에 대한 이해 */}
      <div className="bg-bp-card rounded-2xl p-4 border border-bborder">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-base">💗</span>
          <p className="text-xs text-bp font-semibold">상대에 대한 이해</p>
        </div>
        <p className="text-[13px] text-bd leading-relaxed">{truth.understanding}</p>
      </div>
    </div>
  )
}
