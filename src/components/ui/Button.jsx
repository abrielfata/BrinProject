import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const buttonVariants = {
  variant: {
    default: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700',
    destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
    outline: 'border border-gray-300 bg-white shadow-sm hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200',
    ghost: 'hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 py-1.5 text-sm',
    lg: 'h-10 px-6 py-2.5',
    icon: 'h-9 w-9',
  },
}

const Button = forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  disabled,
  children,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50'
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default
  
  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }