import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-forest-500 text-white shadow-sm hover:bg-forest-600': variant === 'primary',
            'bg-forest-100 text-forest-700 hover:bg-forest-200': variant === 'secondary',
            'text-forest-600 hover:bg-forest-100': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
