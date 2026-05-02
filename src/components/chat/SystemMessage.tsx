interface SystemMessageProps {
  text: string
  showButton?: boolean
  buttonText?: string
  onButtonClick?: () => void
}

export default function SystemMessage({
  text,
  showButton,
  buttonText,
  onButtonClick,
}: SystemMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 my-4 px-4">
      <p className="text-sm text-[#666] text-center leading-relaxed">{text}</p>
      {showButton && buttonText && (
        <button
          onClick={onButtonClick}
          className="bg-[#FF6B9D] text-white rounded-full px-6 py-2 text-sm font-semibold shadow-[0_4px_16px_rgba(255,107,157,0.3)]"
        >
          {buttonText}
        </button>
      )}
    </div>
  )
}
