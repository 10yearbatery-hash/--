// 결과 페이지 단계 진행 표시 컴포넌트
// 기존 Props: current(1~4) 단일 prop 유지

const STEPS = ['상황 요약', '서로의 진심', 'AI 갈등 통역', '앞으로의 약속']

interface ProgressStepsProps {
  current: number  // 1~4
}

export default function ProgressSteps({ current }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center py-3 px-4">
      {STEPS.map((_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${done ? 'bg-bp text-white' : active ? 'bg-bp text-white ring-2 ring-bp ring-offset-2' : 'bg-bborder text-bm'}`}>
              {done ? '✓' : step}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] w-8 transition-colors ${done ? 'bg-bp' : 'bg-bborder'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
