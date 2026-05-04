interface TypingIndicatorProps {
  avatarSrc?: string
}

export default function TypingIndicator({ avatarSrc }: TypingIndicatorProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-[41px] h-[41px] rounded-full flex-shrink-0 overflow-hidden">
        {avatarSrc ? (
          <img src={avatarSrc} alt="AI 캐릭터" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#FF6B9D] flex items-center justify-center text-white text-xs">💗</div>
        )}
      </div>
      <div className="bg-[#fff5f7] rounded-[15px] px-5 py-[15px]">
        <div className="flex gap-1.5 items-center h-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#a0a0b8]"
              style={{ animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
