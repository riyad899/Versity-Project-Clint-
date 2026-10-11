import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        destructive:
          'border-transparent bg-red-600 text-white shadow hover:bg-red-700',
        outline: 'border-slate-200 text-slate-700',
        softBlue: 'border-blue-200 bg-blue-50 text-blue-700 font-medium',
        softGreen: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium',
        softAmber: 'border-amber-200 bg-amber-50 text-amber-700 font-medium',
        softRed: 'border-rose-200 bg-rose-50 text-rose-700 font-medium',
        softPurple: 'border-purple-200 bg-purple-50 text-purple-700 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
