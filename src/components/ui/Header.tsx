'use client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightSlot?: React.ReactNode
  roomCode?: string
  progress?: number
}

export default function Header({ title, subtitle, showBack = false, onBack, rightSlot, roomCode, progress }: HeaderProps) {
  const router = useRouter()
  return (
    <div className="sticky top-0 z-10 bg-white">
      <header className="flex items-center justify-between px-5 py-3">
        <div className="w-10">
          {showBack ? (
            <button onClick={onBack ?? (() => router.back())} className="text-[#1a1a2e] text-xl font-light">‹</button>
          ) : (
            <button className="flex flex-col gap-[6px]" aria-label="메뉴">
              <span className="block w-[22px] h-[2.5px] rounded-full bg-[#a0a0b8]" />
              <span className="block w-[22px] h-[2.5px] rounded-full bg-[#a0a0b8]" />
              <span className="block w-[22px] h-[2.5px] rounded-full bg-[#a0a0b8]" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          {title && <span className="font-jua text-[17px] text-[#1a1a2e]">{title}</span>}
          {roomCode && <span className="text-xs text-[#a0a0b8] font-jua">#{roomCode}</span>}
          {subtitle && <span className="text-[13px] font-jua text-[#a0a0b8]">{subtitle}</span>}
        </div>
        <div className="flex justify-end min-w-[40px]">
          {rightSlot}
        </div>
      </header>
      {progress != null && (
        <div className="h-[3px] bg-pink-gradient" style={{ width: `${Math.min(progress, 1) * 100}%` }} />
      )}
    </div>
  )
}
