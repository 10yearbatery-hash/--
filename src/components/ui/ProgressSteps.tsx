const STEPS = ['상황 요약', '서로의 진심', 'AI 갈등 통역', '앞으로의 약속']

interface ProgressStepsProps {
  current: number
  showActiveLabel?: boolean
}

export default function ProgressSteps({ current, showActiveLabel = false }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-4 px-5 pb-8">
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center">
            <div className="relative flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done
                  ? 'bg-pink-gradient text-white'
                  : active
                    ? 'border-2 border-[#ff6b9d] text-[#ff6b9d]'
                    : 'bg-[#f5f5f5] text-[#a0a0b8]'
                }`}>
                {done ? '✓' : step}
              </div>
              {showActiveLabel && active && (
                <span className="absolute top-9 text-[12px] font-jua text-[#ff6b8a] whitespace-nowrap">
                  {label}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 mx-1 ${done ? 'bg-pink-gradient' : 'bg-[#f5f5f5]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
