import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden'

    const variants = {
      primary:
        'bg-rose-700 text-white hover:bg-rose-600 shadow-rose-glow/30 hover:shadow-rose-glow active:scale-95',
      secondary:
        'bg-parchment-100 text-rose-900 border border-parchment-300 hover:bg-parchment-200 active:scale-95',
      ghost:
        'text-parchment-300 hover:text-white hover:bg-white/10 active:scale-95',
      danger:
        'bg-red-700 text-white hover:bg-red-600 active:scale-95',
      gold:
        'bg-gold-600 text-white hover:bg-gold-500 shadow-gold-glow/30 hover:shadow-gold-glow active:scale-95',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded',
      md: 'px-5 py-2.5 text-sm rounded-sm',
      lg: 'px-8 py-3.5 text-base rounded-sm',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
