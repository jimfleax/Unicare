import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
  x?: number | string
  y?: number | string
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  x = "50%",
  y = "50%",
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-hidden",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70
        const opacity = Math.max(0.02, mainCircleOpacity - i * 0.03)
        const animationDelay = `${i * 0.06}s`
        const borderStyle = "solid"

        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full border shadow-xl"
            style={
              {
                "--i": i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: "1px",
                borderColor: "var(--foreground, rgba(239, 68, 68, 0.35))",
                top: typeof y === "number" ? `${y}px` : y,
                left: typeof x === "number" ? `${x}px` : x,
                transform: "translate(-50%, -50%) scale(1)",
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
})

Ripple.displayName = "Ripple"
export default Ripple
