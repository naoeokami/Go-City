// src/components/ui/Button.tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md',
     loading, children, disabled, ...props }, ref) => {

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost:   'text-gray-600 hover:bg-gray-100',
      danger:  'bg-red-600 hover:bg-red-700 text-white',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'font-medium rounded-lg transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center gap-2 justify-center',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current
                          border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'