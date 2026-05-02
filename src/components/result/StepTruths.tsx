'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'

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
      <div className="flex gap-2">
        {(['A', 'B'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-[#FF6B9D] text-white shadow-[0_4px_16px_rgba(255,107,157,0.3)]'
                : 'bg-[#FFD6E7] text-[#FF6B9D]'
            }`}
          >
            {t === 'A' ? creatorName : partnerName}의 입장
          </button>
        ))}
      </div>
      <Card>
        <p className="text-xs text-[#FF6B9D] font-semibold mb-2">❤️ 가장 속상했던 부분</p>
        <p className="text-sm text-[#1A1A1A] leading-relaxed">{truth.hurt}</p>
      </Card>
      <Card variant="pink">
        <p className="text-xs text-[#FF6B9D] font-semibold mb-2">💛 {name}가 정말로 바랐던 것</p>
        <p className="text-sm text-[#1A1A1A] leading-relaxed">{truth.need}</p>
      </Card>
      <Card className="bg-gray-50 border border-gray-200">
        <p className="text-xs text-[#888] font-semibold mb-2">🤍 상대에 대한 이해</p>
        <p className="text-sm text-[#666] leading-relaxed">{truth.understanding}</p>
      </Card>
    </div>
  )
}
