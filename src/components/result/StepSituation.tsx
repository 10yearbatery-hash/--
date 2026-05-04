import Card from '@/components/ui/Card'

interface Props {
  summary: string
  highlight: string
}

export default function StepSituation({ summary, highlight }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-jua text-[20px] text-[#1a1a2e]">지금 상황을 정리해 봤어요.</h2>
      <Card variant="grey" className="px-5 py-4">
        <p className="font-light text-[15px] leading-relaxed text-[#1a1a2e] whitespace-pre-line">
          {summary}
        </p>
      </Card>
      <Card variant="highlight" className="px-4 py-3 flex gap-2 items-start">
        <span className="text-[#ff6b8a] text-base flex-shrink-0">🔔</span>
        <p className="font-jua text-[15px] text-[#ff6b8a] leading-snug">
          {highlight}
        </p>
      </Card>
    </div>
  )
}
