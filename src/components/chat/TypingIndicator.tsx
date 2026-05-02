export default function TypingIndicator() {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-8 h-8 rounded-full bg-[#FF6B9D] flex items-center justify-center text-white text-xs flex-shrink-0">
        💗
      </div>
      <div className="bg-[#FFD6E7] rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
