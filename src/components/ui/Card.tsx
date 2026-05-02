interface CardProps {
  children: React.ReactNode
  variant?: 'white' | 'pink'
  className?: string
}

export default function Card({ children, variant = 'white', className = '' }: CardProps) {
  const variants = {
    white: 'bg-white border border-[#F0D0DC]',
    pink: 'bg-[#FFD6E7]',
  }
  return (
    <div className={`rounded-2xl p-5 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}
