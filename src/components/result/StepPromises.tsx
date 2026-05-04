'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'

interface PromiseItem {
  id: string
  content: string
}

interface Props {
  promises: PromiseItem[]
  onSave: (selectedContents: string[], customContents: string[]) => void
  loading: boolean
  creatorName?: string
  partnerName?: string
}

interface CheckRowProps {
  name: string
  checked: boolean
  onClick: () => void
}

function CheckRow({ name, checked, onClick }: CheckRowProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5">
      <span className={`w-4 h-4 rounded-[3px] border-[1.5px] flex items-center justify-center text-[10px] transition-all ${
        checked ? 'bg-[#ff6b8a] border-[#ff6b8a] text-white' : 'border-[#a0a0b8] bg-white'
      }`}>
        {checked && '✓'}
      </span>
      <span className={`text-[12px] font-jua ${checked ? 'text-[#ff6b8a]' : 'text-[#a0a0b8]'}`}>{name}</span>
    </button>
  )
}

export default function StepPromises({ promises, onSave, loading, creatorName = '나', partnerName = '상대방' }: Props) {
  const [creatorChecks, setCreatorChecks] = useState<Set<string>>(new Set())
  const [partnerChecks, setPartnerChecks] = useState<Set<string>>(new Set())
  const [customInput, setCustomInput] = useState('')

  function toggle(set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setter((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function isBoth(id: string) {
    return creatorChecks.has(id) && partnerChecks.has(id)
  }

  function handleSave() {
    const selectedContents = promises
      .filter((p) => creatorChecks.has(p.id) || partnerChecks.has(p.id))
      .map((p) => p.content)
    const customs = customInput.trim() ? [customInput.trim()] : []
    onSave(selectedContents, customs)
  }

  const hasSelection = creatorChecks.size > 0 || partnerChecks.size > 0 || customInput.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-jua text-[20px] text-[#1a1a2e]">체크박스를 눌러 함께 약속해보아요.</h2>

      {promises.map((p) => {
        const active = isBoth(p.id)
        return (
          <div
            key={p.id}
            className={`rounded-[15px] p-4 transition-all ${
              active
                ? 'bg-[#fff3f6] border-[3px] border-[#ff6b8a]'
                : 'bg-white border-[3px] border-[#f5f5f5]'
            }`}
          >
            <p className="font-light text-[15px] text-[#1a1a2e] leading-relaxed text-center mb-3">
              {p.content}
            </p>
            <div className="flex justify-center gap-8">
              <CheckRow
                name={creatorName}
                checked={creatorChecks.has(p.id)}
                onClick={() => toggle(creatorChecks, setCreatorChecks, p.id)}
              />
              <CheckRow
                name={partnerName}
                checked={partnerChecks.has(p.id)}
                onClick={() => toggle(partnerChecks, setPartnerChecks, p.id)}
              />
            </div>
          </div>
        )
      })}

      <div className="mt-1">
        <p className="font-jua text-[13px] text-[#a0a0b8] mb-2">직접 약속 추가하기</p>
        <input
          className="w-full border border-[#F0D0DC] rounded-[15px] px-4 py-3 text-[15px] bg-white focus:outline-none focus:border-[#ff6b9d] font-light placeholder:text-[#a0a0b8]"
          placeholder="우리가 지킬 새로운 약속을 적어보세요"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={loading || !hasSelection}>
        {loading ? '저장 중...' : '약속 저장하기'}
      </Button>
    </div>
  )
}
