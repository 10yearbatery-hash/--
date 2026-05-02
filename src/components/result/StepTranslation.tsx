import Card from '@/components/ui/Card'

interface Props {
  body: string
  highlight: string
}

export default function StepTranslation({ body, highlight }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">{body}</p>
      <Card variant="pink">
        <p className="text-sm text-[#FF6B9D] text-center leading-relaxed">💬 {highlight}</p>
      </Card>
    </div>
  )
}
