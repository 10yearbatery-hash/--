interface ChatBubbleProps {
  role: 'ai' | 'user'
  content: string
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  if (role === 'ai') {
    return (
      <div className="flex gap-2 items-start">
        <div className="w-8 h-8 rounded-full bg-[#FF6B9D] flex items-center justify-center text-white text-xs flex-shrink-0">
          💗
        </div>
        <div className="max-w-[75%] bg-[#FFD6E7] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-white border border-[#F0D0DC] rounded-2xl rounded-tr-none px-4 py-3 text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  )
}
