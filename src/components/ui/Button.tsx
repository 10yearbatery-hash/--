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
  const base = 'h-14 rounded-[18px] font-jua text-[22px] transition-opacity disabled:opacity-50 flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-gradient-pink text-white',
    ghost: 'bg-transparent text-bp underline underline-offset-2',
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
