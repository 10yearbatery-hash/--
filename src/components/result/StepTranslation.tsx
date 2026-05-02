// 결과 3단계: 본심 번역 컴포넌트

interface Props {
  body: string
  highlight: string
}

export default function StepTranslation({ body, highlight }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-jua text-[18px] text-bd">저희가 두 분의 언어를 &apos;본심&apos;으로 번역했어요.</p>

      {/* 번역 본문 카드 */}
      <div className="bg-white rounded-2xl p-5 border border-bborder shadow-sm">
        <p className="text-[14px] text-bd leading-relaxed whitespace-pre-line">{body}</p>
      </div>

      {/* 핵심 메시지 카드 */}
      <div className="bg-bp-card rounded-2xl p-4 border border-bborder">
        <p className="text-[13px] text-bp leading-relaxed text-center">💬 {highlight}</p>
      </div>

      {/* 보니·시미 캐릭터 */}
      <div className="flex justify-center gap-4 pt-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-[#F9C8D4] flex items-center justify-center text-xl">
            ·ᴗ·
          </div>
          <span className="text-[11px] text-bm font-semibold">보니</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-bp text-white flex items-center justify-center text-xl">
            ·ˢ·
          </div>
          <span className="text-[11px] text-bm font-semibold">시미</span>
        </div>
      </div>
    </div>
  )
}
