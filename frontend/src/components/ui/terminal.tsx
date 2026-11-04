import React, {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type RefAttributes,
} from "react"
import {
  motion,
  type HTMLMotionProps,
  type MotionProps,
} from "motion/react"

import { cn } from "@/lib/utils"
import "./terminal.css"

interface SequenceContextValue {
  completeItem: (index: number) => void
  activeIndex: number
  sequenceStarted: boolean
}

const SequenceContext = createContext<SequenceContextValue | null>(null)
const useSequence = () => useContext(SequenceContext)

const ItemIndexContext = createContext<number | null>(null)
const useItemIndex = () => useContext(ItemIndexContext)

const motionElements = {
  article: motion.article,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  li: motion.li,
  p: motion.p,
  section: motion.section,
  span: motion.span,
} as const

export type MotionElementType = keyof typeof motionElements
type TerminalTypingMotionComponent = ComponentType<
  Omit<HTMLMotionProps<"span">, "ref"> & RefAttributes<HTMLElement>
>

/* Helper to recursively flatten React children including nested arrays */
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const result: React.ReactNode[] = []
  Children.forEach(children, (child) => {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child))
      return
    }
    if (React.isValidElement(child) && child.type === React.Fragment) {
      result.push(...flattenChildren((child.props as any).children))
      return
    }
    if (child !== null && child !== undefined && child !== false) {
      result.push(child)
    }
  })
  return result
}

export interface AnimatedSpanProps extends MotionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
  ...props
}: AnimatedSpanProps) => {
  const sequence = useSequence()
  const itemIndex = useItemIndex()
  const [isRevealed, setIsRevealed] = useState(false)

  const canReveal = !sequence || itemIndex === null || (sequence.sequenceStarted && sequence.activeIndex >= itemIndex)

  useEffect(() => {
    if (!canReveal) {
      setIsRevealed(false)
      return
    }

    const timer = setTimeout(() => {
      setIsRevealed(true)
      if (sequence && itemIndex !== null) {
        sequence.completeItem(itemIndex)
      }
    }, Math.max(delay, 90))

    return () => clearTimeout(timer)
  }, [canReveal, sequence, itemIndex, delay])

  if (!canReveal && sequence && itemIndex !== null) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : -2 }}
      transition={{ duration: 0.18 }}
      className={cn("terminal-line font-mono", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface TypingAnimationProps extends Omit<MotionProps, "children"> {
  children: string
  className?: string
  duration?: number
  delay?: number
  as?: MotionElementType
}

export const TypingAnimation = ({
  children,
  className,
  duration = 16,
  delay = 0,
  as: Component = "span",
  ...props
}: TypingAnimationProps) => {
  if (typeof children !== "string") {
    throw new Error("TypingAnimation: children must be a string.")
  }

  const MotionComponent = (motionElements[Component] || motion.span) as TerminalTypingMotionComponent

  const sequence = useSequence()
  const itemIndex = useItemIndex()
  const [displayedText, setDisplayedText] = useState<string>("")
  const [isTypingDone, setIsTypingDone] = useState(false)

  const canStart = !sequence || itemIndex === null || (sequence.sequenceStarted && sequence.activeIndex >= itemIndex)

  useEffect(() => {
    if (!canStart) {
      setDisplayedText("")
      setIsTypingDone(false)
      return
    }

    let startTimer: ReturnType<typeof setTimeout> | null = null
    let typingInterval: ReturnType<typeof setInterval> | null = null

    startTimer = setTimeout(() => {
      let i = 0
      typingInterval = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(children.slice(0, i + 1))
          i++
        } else {
          if (typingInterval) clearInterval(typingInterval)
          setIsTypingDone(true)
          if (sequence && itemIndex !== null) {
            sequence.completeItem(itemIndex)
          }
        }
      }, duration)
    }, delay)

    return () => {
      if (startTimer) clearTimeout(startTimer)
      if (typingInterval) clearInterval(typingInterval)
    }
  }, [canStart, children, duration, delay, sequence, itemIndex])

  if (!canStart && sequence && itemIndex !== null) {
    return null
  }

  const textToShow = isTypingDone ? children : displayedText

  return (
    <MotionComponent
      className={cn("terminal-line terminal-command font-mono", className)}
      {...props}
    >
      <span>{textToShow}</span>
      {!isTypingDone && (
        <span className="terminal-cursor" />
      )}
    </MotionComponent>
  )
}

export interface TerminalProps {
  children: React.ReactNode
  className?: string
  sequence?: boolean
  theme?: "dark" | "light"
  title?: string
}

export const Terminal = ({
  children,
  className,
  sequence = true,
  theme = "dark",
  title = "unicare@diagnostics-daemon — zsh",
}: TerminalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasReachedSection, setHasReachedSection] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Start sequence ONLY when the user scrolls and reaches the section
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      setHasReachedSection(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry && entry.isIntersecting) {
          setHasReachedSection(true)
          observer.disconnect()
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -70px 0px",
        threshold: 0.22,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sequenceHasStarted = sequence && hasReachedSection && !isPaused

  const contextValue = useMemo<SequenceContextValue | null>(() => {
    if (!sequence) return null
    return {
      completeItem: (index: number) => {
        if (!isPaused && hasReachedSection) {
          setActiveIndex((current) => Math.max(current, index + 1))
        }
      },
      activeIndex,
      sequenceStarted: sequenceHasStarted,
    }
  }, [sequence, activeIndex, isPaused, hasReachedSection, sequenceHasStarted])

  const flatChildren = useMemo(() => flattenChildren(children), [children])

  const wrappedChildren = useMemo(() => {
    if (!sequence) return flatChildren
    return flatChildren.map((child, index) => (
      <ItemIndexContext.Provider key={`${resetKey}-${index}`} value={index}>
        {child as React.ReactNode}
      </ItemIndexContext.Provider>
    ))
  }, [flatChildren, sequence, resetKey])

  const handleReset = () => {
    setActiveIndex(0)
    setResetKey((k) => k + 1)
    setHasReachedSection(true) // restart sequence immediately
  }

  const handleTogglePause = () => {
    setIsPaused((p) => !p)
  }

  const isLight = theme === "light"

  const card = (
    <div ref={containerRef} className="terminal-window-wrapper">
      <div
        className={cn(
          "terminal-window-card",
          isLight ? "terminal-theme-light" : "terminal-theme-dark",
          className
        )}
      >
        {/* Title Bar (Clean Minimal macOS Header) */}
        <div className="terminal-window-header">
          {/* Left Traffic Light Buttons */}
          <div className="terminal-window-dots">
            <button
              type="button"
              className="terminal-dot terminal-dot-close"
              onClick={handleReset}
              title="Restart diagnostics sequence"
              aria-label="Restart diagnostics sequence"
            />
            <button
              type="button"
              className="terminal-dot terminal-dot-minimize"
              onClick={handleTogglePause}
              title={isPaused ? "Resume telemetry" : "Pause telemetry"}
              aria-label={isPaused ? "Resume telemetry" : "Pause telemetry"}
            />
            <span
              className="terminal-dot terminal-dot-maximize"
              title="Active session"
              aria-label="Active session"
            />
          </div>

          {/* Centered Window Title with Proper Green Pulse LED */}
          <div className="terminal-window-title">
            <span className="terminal-live-dot" />
            <span>{title}</span>
          </div>

          {/* Right Header: Clean subtle shell indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 opacity-70">
            <span>zsh</span>
          </div>
        </div>

        {/* Code Stream Container — Real-time telemetry processes */}
        <pre className="terminal-window-body">
          <code className="terminal-code-stream">
            {wrappedChildren}
            {/* Blinking prompt line with proper green prompt & cursor */}
            <div className="terminal-line mt-2 text-zinc-400 flex items-center gap-1.5 font-mono text-xs">
              <span className={isLight ? "text-green-700 font-semibold" : "text-green-500 font-semibold"}>
                unicare@campus-telemetry:~$
              </span>
              <span className="terminal-cursor" />
            </div>
          </code>
        </pre>

        {/* Footer Info Bar */}
        <div className="terminal-window-footer">
          <div className="terminal-footer-meta">
            <span>● UTF-8</span>
            <span>● Port 5000</span>
            <span>● Telemetry Daemon: {isPaused ? "PAUSED" : "ACTIVE"}</span>
          </div>
          <div className="terminal-footer-status">
            <span className="terminal-live-dot" />
            <span>Live Diagnostics Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (!sequence) return card

  return (
    <SequenceContext.Provider value={contextValue}>
      {card}
    </SequenceContext.Provider>
  )
}

export default Terminal
