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
  const base = 'h-[52px] rounded-full font-semibold text-base transition-opacity disabled:opacity-50'
  const variants = {
    primary: 'bg-[#FF6B9D] text-white shadow-[0_4px_16px_rgba(255,107,157,0.3)]',
    ghost: 'bg-transparent text-[#FF6B9D] underline',
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
