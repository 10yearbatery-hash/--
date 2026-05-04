interface ChatBubbleProps {
  role: 'ai' | 'user'
  content: string
  avatarSrc?: string
}

export default function ChatBubble({ role, content, avatarSrc }: ChatBubbleProps) {
  if (role === 'ai') {
    return (
      <div className="flex gap-2 items-start">
        <div className="w-[41px] h-[41px] rounded-full flex-shrink-0 overflow-hidden">
          {avatarSrc ? (
            <img src={avatarSrc} alt="AI 캐릭터" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#FF6B9D] flex items-center justify-center text-white text-xs">💗</div>
          )}
        </div>
        <div className="max-w-[75%] bg-[#fff5f7] rounded-[15px] px-5 py-[15px] text-[15px] text-[#1a1a2e] leading-relaxed whitespace-pre-line font-light">
          {content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-[#ff85a1] rounded-[15px] px-5 py-[15px] text-[15px] text-white leading-relaxed whitespace-pre-line font-light">
        {content}
      </div>
    </div>
  )
}
