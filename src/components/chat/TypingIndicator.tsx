export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-9 h-9 rounded-full bg-[#F9C8D4] flex items-center justify-center flex-shrink-0">
        <span className="text-bd text-xs">·ᴗ·</span>
      </div>
      <div className="bg-bp-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-2 h-2 rounded-full bg-bp animate-typing-dot" />
        <span className="w-2 h-2 rounded-full bg-bp animate-typing-dot-2" />
        <span className="w-2 h-2 rounded-full bg-bp animate-typing-dot-3" />
      </div>
    </div>
  )
}
