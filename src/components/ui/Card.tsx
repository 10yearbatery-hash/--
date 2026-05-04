interface CardProps {
  children: React.ReactNode
  variant?: 'white' | 'pink' | 'grey' | 'highlight' | 'yellow' | 'blue' | 'promise-active' | 'promise-inactive'
  className?: string
}

export default function Card({ children, variant = 'white', className = '' }: CardProps) {
  const variants: Record<string, string> = {
    white: 'bg-white border border-[#F0D0DC]',
    pink: 'bg-[#FFD6E7]',
    grey: 'bg-[#f8f8fa] rounded-[15px]',
    highlight: 'bg-[#fff5f7] rounded-[15px]',
    yellow: 'bg-[#fff8f0] rounded-[15px]',
    blue: 'bg-[#f5f8ff] rounded-[15px]',
    'promise-active': 'bg-[#fff3f6] border-[3px] border-[#ff6b8a] rounded-[15px]',
    'promise-inactive': 'bg-white border-[3px] border-[#f5f5f5] rounded-[15px]',
  }
  const base = variant === 'white' ? 'rounded-2xl p-5' : 'p-5'
  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
