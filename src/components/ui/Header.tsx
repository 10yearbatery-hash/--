'use client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showBack?: boolean
  rightSlot?: React.ReactNode
  roomCode?: string
}

export default function Header({ title, showBack = false, rightSlot, roomCode }: HeaderProps) {
  const router = useRouter()
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[#FFF5F8] sticky top-0 z-10">
      <div className="w-10">
        {showBack ? (
          <button onClick={() => router.back()} className="text-[#FF6B9D] text-xl">←</button>
        ) : (
          <span className="text-xl text-[#666]">☰</span>
        )}
      </div>
      <div className="flex flex-col items-center">
        {title && <span className="font-semibold text-[#1A1A1A]">{title}</span>}
        {roomCode && <span className="text-xs text-[#FF6B9D] font-mono">#{roomCode}</span>}
      </div>
      <div className="w-10 flex justify-end">
        {rightSlot}
      </div>
    </header>
  )
}
