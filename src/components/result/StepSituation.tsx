// 결과 1단계: 상황 요약 컴포넌트

interface Props {
  summary: string
  highlight: string
}

export default function StepSituation({ summary, highlight }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-jua text-[18px] text-bd">지금 상황을 정리해 봤어요.</p>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-bborder">
        <p className="text-[14px] text-bd leading-relaxed">{summary}</p>
      </div>
      <div className="bg-bp-card rounded-2xl p-4 flex gap-3 items-start">
        <span className="text-bp text-lg flex-shrink-0">🔔</span>
        <p className="text-[13px] text-bp leading-relaxed">{highlight}</p>
      </div>
    </div>
  )
}
