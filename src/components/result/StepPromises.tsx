'use client'
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface PromiseItem {
  id: string
  content: string
}

interface Props {
  promises: PromiseItem[]
  onSave: (selectedContents: string[], customContents: string[]) => void
  loading: boolean
}

export default function StepPromises({ promises, onSave, loading }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customInput, setCustomInput] = useState('')

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSave() {
    const selectedContents = promises
      .filter((p) => selected.has(p.id))
      .map((p) => p.content)
    const customs = customInput.trim() ? [customInput.trim()] : []
    onSave(selectedContents, customs)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card variant="pink">
        <p className="text-sm font-semibold text-[#FF6B9D]">💎 앞으로의 약속</p>
        <p className="text-xs text-[#666] mt-1">체크박스를 눌러 약속을 함께 해보세요</p>
      </Card>

      {promises.map((p, i) => (
        <div key={p.id} className="flex gap-3 items-start">
          <button
            onClick={() => toggle(p.id)}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
              selected.has(p.id)
                ? 'bg-[#FF6B9D] border-[#FF6B9D]'
                : 'border-[#F0D0DC] bg-white'
            }`}
          >
            {selected.has(p.id) && <span className="text-white text-xs leading-none">✓</span>}
          </button>
          <div className="flex-1">
            <p className="text-xs text-[#FF6B9D] font-semibold mb-1">0{i + 1}</p>
            <p className="text-sm text-[#1A1A1A] leading-relaxed">{p.content}</p>
          </div>
        </div>
      ))}

      <div>
        <p className="text-xs text-[#666] mb-2">직접 약속 추가하기</p>
        <input
          className="w-full border border-[#F0D0DC] rounded-2xl px-4 py-3 text-sm bg-[#FFF5F8] focus:outline-none focus:border-[#FF6B9D]"
          placeholder="우리가 지킬 새로운 약속을 적어보세요"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={loading || (selected.size === 0 && !customInput.trim())}>
        {loading ? '저장 중...' : '약속 저장하기 💝'}
      </Button>
    </div>
  )
}
