import React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={`rdx-progress ${className || ''}`}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={`rdx-progress-indicator ${indicatorClassName || ''}`}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
