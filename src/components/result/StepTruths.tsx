'use client'
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

interface TruthCardProps {
  bg: string
  label: string
  body: string
}

function TruthCard({ bg, label, body }: TruthCardProps) {
  return (
    <div className="rounded-[15px] p-4" style={{ background: bg }}>
      <div className="flex gap-2 items-center mb-2">
        <span className="text-[#a0a0b8] text-sm">🔔</span>
        <span className="text-[13px] font-jua text-[#a0a0b8]">{label}</span>
      </div>
      <p className="font-light text-[15px] text-[#1a1a2e] leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </div>
  )
}

export default function StepTruths({ creatorName, partnerName, truthA, truthB }: Props) {
  const [tab, setTab] = useState<'A' | 'B'>('A')
  const truth = tab === 'A' ? truthA : truthB

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-jua text-[20px] text-[#1a1a2e]">서로는 지금 이렇게 생각하고 있어요.</h2>
      <div className="border-[5px] border-[#ff7391] rounded-[15px] p-3 bg-white">
        {/* 탭 */}
        <div className="flex gap-2 mb-3">
          {(['A', 'B'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-full font-jua text-[15px] transition-all ${
                tab === t
                  ? 'bg-[#ff7391] text-white'
                  : 'text-[#a0a0b8]'
              }`}
            >
              {t === 'A' ? creatorName : partnerName}의 입장
            </button>
          ))}
        </div>
        {/* 카드 3종 */}
        <div className="flex flex-col gap-3">
          <TruthCard bg="#fff5f7" label="가장 속상했던 부분" body={truth.hurt} />
          <TruthCard bg="#fff8f0" label="정말로 바랐던 것" body={truth.need} />
          <TruthCard bg="#f5f8ff" label="상대에 대한 이해" body={truth.understanding} />
        </div>
      </div>
    </div>
  )
}
