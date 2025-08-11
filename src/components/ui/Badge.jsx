import { cn } from '../../lib/utils'

const badgeVariants = {
  variant: {
    default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
    outline: 'text-gray-900 border-gray-300',
  },
}

function Badge({ className, variant = 'default', ...props }) {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  const variantClasses = badgeVariants.variant[variant] || badgeVariants.variant.default
  
  return (
    <div 
      className={cn(baseClasses, variantClasses, className)} 
      {...props} 
    />
  )
}

export { Badge }