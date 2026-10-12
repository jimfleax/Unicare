import React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`rdx-label ${className || ''}`}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
