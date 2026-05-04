import Card from '@/components/ui/Card'

interface Props {
  body: string
  highlight: string
}

export default function StepTranslation({ body, highlight }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-jua text-[20px] text-[#1a1a2e]">
        저희가 두 분의 언어를 &apos;본심&apos;으로 번역했어요.
      </h2>
      <Card variant="grey" className="px-5 py-4">
        <p className="font-light text-[15px] leading-relaxed text-[#1a1a2e] whitespace-pre-line">
          {body}
        </p>
      </Card>
      {highlight && (
        <Card variant="highlight" className="px-4 py-3 flex gap-2 items-start">
          <span className="text-[#ff6b8a] text-base flex-shrink-0">🔔</span>
          <p className="font-jua text-[15px] text-[#ff6b8a] leading-snug">{highlight}</p>
        </Card>
      )}
      <div className="flex justify-center mt-2">
        <img
          src="/vonsim-translate.png"
          alt="VonSim 캐릭터"
          className="w-[160px] h-auto object-contain"
        />
      </div>
    </div>
  )
}
