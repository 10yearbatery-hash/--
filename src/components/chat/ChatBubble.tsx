interface Props {
  role: 'ai' | 'user'
  content: string
}

export default function ChatBubble({ role, content }: Props) {
  if (role === 'ai') {
    return (
      <div className="flex gap-3 items-end">
        <div className="w-9 h-9 rounded-full bg-[#F9C8D4] flex items-center justify-center flex-shrink-0">
          <span className="text-bd text-xs">·ᴗ·</span>
        </div>
        <div className="max-w-[75%] bg-bp-muted rounded-2xl rounded-bl-sm px-4 py-3">
          <p className="text-[14px] text-bd leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-bp rounded-2xl rounded-br-sm px-4 py-3">
        <p className="text-[14px] text-white leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
