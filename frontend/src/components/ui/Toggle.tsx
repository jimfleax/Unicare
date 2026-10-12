import React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={`rdx-toggle ${className || ''}`}
    {...props}
  />
))
Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
