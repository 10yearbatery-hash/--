import Card from '@/components/ui/Card'

interface Props {
  summary: string
  highlight: string
}

export default function StepSituation({ summary, highlight }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold text-[#1A1A1A] mb-3">🔍 지금 상황을 정리해 봤어요</p>
        <p className="text-sm text-[#666] leading-relaxed">{summary}</p>
      </Card>
      <Card variant="pink">
        <p className="text-sm text-[#FF6B9D] leading-relaxed text-center">💡 {highlight}</p>
      </Card>
    </div>
  )
}
