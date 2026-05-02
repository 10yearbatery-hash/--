const STEPS = ['상황 요약', '서로의 진심', 'AI 갈등 통역', '앞으로의 약속']

interface ProgressStepsProps {
  current: number  // 1~4
}

export default function ProgressSteps({ current }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-4 px-5">
      {STEPS.map((_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${done ? 'bg-[#FF6B9D] text-white' : active ? 'border-2 border-[#FF6B9D] text-[#FF6B9D]' : 'bg-gray-200 text-gray-400'}`}>
              {done ? '✓' : step}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 ${done ? 'bg-[#FF6B9D]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
