interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  fullWidth = true,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'h-14 rounded-[18px] font-semibold text-[25px] transition-opacity disabled:opacity-50 flex items-center justify-center gap-3'
  const variants = {
    primary: 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8FB3] text-white shadow-[0_4px_16px_rgba(255,107,157,0.3)] font-jua',
    ghost: 'bg-transparent text-[#FF6B9D] underline font-jua',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
