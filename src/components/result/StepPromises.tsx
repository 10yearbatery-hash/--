'use client'
// 결과 4단계: 앞으로의 약속 컴포넌트

import { useState } from 'react'

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
      <p className="font-jua text-[18px] text-bd">체크박스를 눌러 함께 약속해보아요.</p>

      {/* 약속 목록 */}
      {promises.map((p, i) => (
        <div
          key={p.id}
          className="bg-white rounded-2xl p-4 border-2 border-bborder flex gap-3 items-start"
        >
          {/* 체크박스 */}
          <button
            onClick={() => toggle(p.id)}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
              selected.has(p.id)
                ? 'bg-bp border-bp'
                : 'border-bborder bg-white'
            }`}
          >
            {selected.has(p.id) && (
              <span className="text-white text-xs leading-none">✓</span>
            )}
          </button>
          <div className="flex-1">
            <p className="text-xs text-bp font-semibold mb-1">0{i + 1}</p>
            <p className="text-[13px] text-bd leading-relaxed">{p.content}</p>
          </div>
        </div>
      ))}

      {/* 직접 약속 추가 */}
      <div>
        <p className="text-xs text-bm mb-2">직접 약속 추가하기</p>
        <input
          className="w-full border border-bborder rounded-2xl px-4 py-3 text-sm bg-bp-bg focus:outline-none focus:border-bp text-bd placeholder:text-bm"
          placeholder="우리가 지킬 새로운 약속을 적어보세요"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        disabled={loading || (selected.size === 0 && !customInput.trim())}
        className="w-full h-14 bg-gradient-pink rounded-[18px] font-jua text-[22px] text-white disabled:opacity-40 transition-opacity"
      >
        {loading ? '저장 중...' : '약속 저장하기 💝'}
      </button>
    </div>
  )
}
