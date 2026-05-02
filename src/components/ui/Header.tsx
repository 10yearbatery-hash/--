'use client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  rightSlot?: React.ReactNode
  roomCode?: string
}

export default function Header({ title, showBack = false, onBack, rightSlot, roomCode }: HeaderProps) {
  const router = useRouter()
  return (
    <header className="flex items-center justify-between px-6 pt-10 pb-3 bg-bp-bg sticky top-0 z-10">
      <div className="w-10">
        {showBack ? (
          <button onClick={onBack ?? (() => router.back())} className="text-bd text-2xl font-bold leading-none">‹</button>
        ) : (
          <button className="flex flex-col gap-[6px]">
            <span className="block w-[22px] h-[2.5px] rounded-full bg-bd" />
            <span className="block w-[22px] h-[2.5px] rounded-full bg-bd" />
            <span className="block w-[22px] h-[2.5px] rounded-full bg-bd" />
          </button>
        )}
      </div>
      <div className="flex flex-col items-center">
        {title && <span className="font-jua text-[17px] text-bd">{title}</span>}
        {roomCode && <span className="text-xs text-bm font-mono">#{roomCode}</span>}
      </div>
      <div className="w-10 flex justify-end">
        {rightSlot}
      </div>
    </header>
  )
}
