import { useState, useEffect, useRef } from 'react'
import {
  Search, MapPin, UserCheck, AlertTriangle,
  ClipboardList, Cpu, Radio, ShieldCheck
} from 'lucide-react'

export function SmartRoutingSection() {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const [centerStage, setCenterStage] = useState<number | null>(null)
  const [visibleStages, setVisibleStages] = useState<Record<number, boolean>>({})
  const [passedStages, setPassedStages] = useState<Record<number, boolean>>({})
  const [isConclusionVisible, setIsConclusionVisible] = useState(false)

  const timelineRef = useRef<HTMLDivElement | null>(null)
  const progressLineRef = useRef<HTMLDivElement | null>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const conclusionRef = useRef<HTMLDivElement | null>(null)

  // Fast layout cache to avoid calling getBoundingClientRect repeatedly in scroll listener
  const rowMetricsRef = useRef<{ top: number; center: number }[]>([])
  const conclusionTopRef = useRef<number>(0)
  const currentCenterRef = useRef<number | null>(null)
  const visibleStagesRef = useRef<Record<number, boolean>>({})
  const passedStagesRef = useRef<Record<number, boolean>>({})

  const stages = [
    {
      num: '01',
      label: 'Identify',
      question: "What's wrong?",
      desc: 'The reported issue is categorized by type — electrical, HVAC, plumbing, network, furniture, and more.',
      icon: Search,
    },
    {
      num: '02',
      label: 'Locate',
      question: 'Where is it?',
      desc: 'The system uses the reported location to identify the relevant building, floor, room, or facility.',
      icon: MapPin,
    },
    {
      num: '03',
      label: 'Match',
      question: 'Who can fix it?',
      desc: 'Available technicians are matched based on specialization, availability, and assigned area.',
      icon: UserCheck,
    },
    {
      num: '04',
      label: 'Prioritize',
      question: 'How urgent is it?',
      desc: 'Issues are prioritized based on severity and operational impact, ensuring critical problems are handled first.',
      icon: AlertTriangle,
    },
  ]

  // ── High Performance Scroll-Linked Line & Center Auto-Hover ──
  useEffect(() => {
    let rafId: number

    // Measure layout metrics once and on resize (zero reflow during scrolling)
    const measureLayout = () => {
      if (!timelineRef.current) return
      rowMetricsRef.current = rowRefs.current.map((el) => {
        if (!el) return { top: 0, center: 0 }
        return {
          top: el.offsetTop,
          center: el.offsetTop + el.offsetHeight * 0.5,
        }
      })
      if (conclusionRef.current) {
        conclusionTopRef.current = conclusionRef.current.offsetTop
      }
    }

    measureLayout()

    const updateScroll = () => {
      const timeline = timelineRef.current
      if (!timeline) return

      const timelineRect = timeline.getBoundingClientRect()
      const timelineHeight = timelineRect.height
      const screenH = window.innerHeight
      const triggerY = screenH * 0.55

      // How far down has the trigger penetrated?
      const rawProgress = triggerY - timelineRect.top
      const progressHeight = Math.max(0, Math.min(timelineHeight, rawProgress))

      // Direct style update for 120fps hardware-accelerated smoothness
      if (progressLineRef.current) {
        progressLineRef.current.style.height = `${progressHeight}px`
      }

      // 1. Sequential Card Reveals (One by one)
      let visibleChanged = false
      let passedChanged = false

      rowMetricsRef.current.forEach((metric, idx) => {
        // As the line reaches near the row top, reveal it
        if (progressHeight >= metric.top - 50 || (timelineRect.top + metric.top) <= screenH * 0.88) {
          if (!visibleStagesRef.current[idx]) {
            visibleStagesRef.current[idx] = true
            visibleChanged = true
          }
        }

        // Passed status
        if (progressHeight >= metric.center - 10) {
          if (!passedStagesRef.current[idx]) {
            passedStagesRef.current[idx] = true
            passedChanged = true
          }
        }
      })

      if (visibleChanged) {
        setVisibleStages({ ...visibleStagesRef.current })
      }
      if (passedChanged) {
        setPassedStages({ ...passedStagesRef.current })
      }

      // Check conclusion box
      if (conclusionTopRef.current > 0) {
        if (progressHeight >= conclusionTopRef.current - 60 || (timelineRect.top + conclusionTopRef.current) <= screenH * 0.88) {
          setIsConclusionVisible(true)
        }
      }

      // 2. Automatically hover the card in the center of the viewport
      let closestIdx: number | null = null
      let closestDist = Infinity

      rowMetricsRef.current.forEach((metric, idx) => {
        const rowScreenCenter = timelineRect.top + metric.center
        const dist = Math.abs(rowScreenCenter - screenH * 0.5)
        if (dist < screenH * 0.38 && dist < closestDist) {
          closestDist = dist
          closestIdx = idx
        }
      })

      // Only trigger React state change if center card actually changed
      if (currentCenterRef.current !== closestIdx) {
        currentCenterRef.current = closestIdx
        setCenterStage(closestIdx)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateScroll)
    }

    const onResize = () => {
      measureLayout()
      onScroll()
    }

    updateScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section className="smart-routing-section">
      <div className="smart-routing-container">

        {/* Header */}
        <div className="smart-routing-header reveal-fade-up">
          <p className="smart-routing-eyebrow">AUTOMATED DISPATCH ENGINE</p>
          <h2 className="smart-routing-title">Smart <span className="text-red-highlight">Routing</span></h2>
          <p className="smart-routing-subtitle">
            THE RIGHT ISSUE. <span className="text-red-highlight">THE RIGHT PERSON.</span>
          </p>
          <p className="smart-routing-desc">
            Every report is automatically categorized, prioritized, and routed to the appropriate maintenance team so issues reach the people who can actually fix them.
          </p>
        </div>

        {/* Vertical Timeline Process */}
        <div ref={timelineRef} className="sr-timeline">
          {/* Continuous Glowing Progress Spine (Behind elements) */}
          <div className="sr-timeline-line-wrap" aria-hidden="true">
            <div className="sr-timeline-track" />
            <div ref={progressLineRef} className="sr-timeline-progress" />
          </div>

          {stages.map((stage, idx) => {
            const Icon = stage.icon
            const isHovered = hoveredStage === idx
            const isAutoHovered = hoveredStage === null && centerStage === idx
            const isActive = isHovered || isAutoHovered
            const isVisible = !!visibleStages[idx]
            const isPassed = !!passedStages[idx]
            const isEven = idx % 2 === 0 // even = right content, odd = left content

            return (
              <div
                key={stage.num}
                ref={(el) => { rowRefs.current[idx] = el }}
                data-stage-index={idx}
                className={`sr-timeline-row ${isEven ? 'sr-row-right sr-anim-right' : 'sr-row-left sr-anim-left'} ${isVisible ? 'is-visible' : ''} ${isActive ? 'sr-row-active' : ''} ${isPassed ? 'sr-row-passed' : ''}`}
                onMouseEnter={() => setHoveredStage(idx)}
                onMouseLeave={() => setHoveredStage(null)}
                onTouchStart={() => setHoveredStage(idx)}
              >
                {/* Content card */}
                <div className="sr-timeline-card">
                  <div className="sr-card-indicator" />
                  <div className="sr-card-label">{stage.label}</div>
                  <h3 className="sr-card-question">{stage.question}</h3>
                  <p className="sr-card-desc">{stage.desc}</p>
                </div>

                {/* Center connector: circle with icon + number */}
                <div className="sr-timeline-center">
                  <div className={`sr-timeline-node ${isActive ? 'sr-node-active' : ''} ${isPassed ? 'sr-node-passed' : ''}`}>
                    <Icon size={22} />
                  </div>
                </div>

                {/* Number badge on the opposite side */}
                <div className="sr-timeline-num-side">
                  <span className="sr-timeline-num">{stage.num}</span>
                </div>
              </div>
            )
          })}

          {/* Conclusion box – terminal step */}
          <div 
            ref={conclusionRef}
            className={`sr-timeline-conclusion ${isConclusionVisible ? 'is-visible' : ''}`}
          >
            <p className="sr-conclusion-text">
              And there you have <strong>the right person</strong> dealing with <strong>the right issue</strong> without any manual efforts.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}export function WhatHappensNextSection() {
  const steps = [
    {
      num: '01',
      title: 'Your Report Is Logged',
      desc: 'Your issue, location, description, and attached media are recorded and given a unique request ID.',
      icon: ClipboardList,
      side: 'left' as const,
    },
    {
      num: '02',
      title: 'The Issue Is Analyzed',
      desc: 'The system identifies the issue category, severity, and required service.',
      icon: Cpu,
      side: 'right' as const,
    },
    {
      num: '03',
      title: 'The Right Technician Is Found',
      desc: 'The request is matched with an available technician based on expertise, location, and workload.',
      icon: UserCheck,
      side: 'left' as const,
    },
    {
      num: '04',
      title: 'You Get Real-Time Updates',
      desc: 'Track your request as it moves through Assigned → In Progress → Resolved.',
      icon: Radio,
      side: 'right' as const,
    },
    {
      num: '05',
      title: 'Resolution Is Confirmed',
      desc: 'Once the work is completed, the issue is marked resolved and the requester can verify the fix.',
      icon: ShieldCheck,
      side: 'left' as const,
    },
  ]

  return (
    <section className="whn-fluid-section reveal-on-scroll">
      <div className="whn-fluid-container">
        {/* Header */}
        <div className="whn-header reveal-fade-up">
          <p className="whn-eyebrow">WORKFLOW PIPELINE</p>
          <h2 className="whn-title">
            What Happens <span className="text-red-highlight">Next?</span>
          </h2>
          <p className="whn-subtitle">
            From initial report to verified completion — here's how every issue travels through our automated resolution engine.
          </p>
        </div>

        {/* Infographic Tree */}
        <div className="whn-tree">
          {/* Continuous Organic Serpentine Spine (SVG) */}
          <div className="whn-spine-svg-wrap" aria-hidden="true">
            <svg
              className="whn-spine-svg"
              viewBox="0 0 160 840"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="whnSpineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#b91c1c" />
                  <stop offset="35%" stopColor="#dc2626" />
                  <stop offset="70%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <filter id="whnSpineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(220, 38, 38, 0.45)" />
                </filter>
              </defs>

              {/* Serpentine flowing fluid ribbon connecting node centers at Y: 60, 230, 400, 570, 740 */}
              <path
                d="M 50 60
                   C 50 145, 110 145, 110 230
                   C 110 315, 50 315, 50 400
                   C 50 485, 110 485, 110 570
                   C 110 655, 50 655, 50 740"
                fill="none"
                stroke="url(#whnSpineGrad)"
                strokeWidth="28"
                strokeLinecap="round"
                filter="url(#whnSpineGlow)"
              />

              {/* Inner accent flow line */}
              <path
                d="M 50 60
                   C 50 145, 110 145, 110 230
                   C 110 315, 50 315, 50 400
                   C 50 485, 110 485, 110 570
                   C 110 655, 50 655, 50 740"
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="3"
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="whn-spine-pulse"
              />
            </svg>
          </div>

          {/* 5 Rows */}
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isLeft = step.side === 'left'

            return (
              <div
                key={step.num}
                className={`whn-row whn-row-${step.side} ${isLeft ? 'reveal-fade-left' : 'reveal-fade-right'} delay-${Math.min(idx + 1, 3)}`}
              >
                {/* Left side card wrap (only if isLeft) */}
                {isLeft ? (
                  <div className="whn-card-wrap whn-card-wrap-left">
                    <div className="whn-capsule-card whn-capsule-left">
                      <div className="whn-capsule-dashed-border" />
                      <div className="whn-capsule-body">
                        <span className="whn-card-num-tag">{step.num} — STEP</span>
                        <h3 className="whn-card-title">{step.title}</h3>
                        <p className="whn-card-desc">{step.desc}</p>
                      </div>
                    </div>
                    {/* Horizontal solid branch line extending to the central node */}
                    <div className="whn-branch-line" />
                  </div>
                ) : (
                  <div className="whn-opposite-spacer" />
                )}

                {/* Central Bulbous Node */}
                <div className="whn-node-anchor">
                  <div className="whn-bulbous-node">
                    <div className="whn-node-core">
                      <Icon className="whn-node-icon" size={26} />
                    </div>
                  </div>
                </div>

                {/* Right side card wrap (only if !isLeft) */}
                {!isLeft ? (
                  <div className="whn-card-wrap whn-card-wrap-right">
                    {/* Horizontal solid branch line extending from central node to card */}
                    <div className="whn-branch-line" />
                    <div className="whn-capsule-card whn-capsule-right">
                      <div className="whn-capsule-dashed-border" />
                      <div className="whn-capsule-body">
                        <span className="whn-card-num-tag">{step.num} — STEP</span>
                        <h3 className="whn-card-title">{step.title}</h3>
                        <p className="whn-card-desc">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="whn-opposite-spacer" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface StepData {
  num: string
  title: string
  desc: string
  arcClass: string
  dots: Array<{ cx: number; cy: number; r: number; cls: string }>
}

function WorkflowStepCard({
  step,
  index,
  hoveredIndex,
  onHover,
  onLeave,
}: {
  step: StepData
  index: number
  hoveredIndex: number | null
  onHover: (idx: number) => void
  onLeave: () => void
}) {
  const rotatorRef = useRef<SVGGElement | null>(null)
  const angleRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const isHoveredRef = useRef<boolean>(false)

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const startClockwiseHover = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    let lastTime = performance.now()
    const ROTATION_SPEED = 85 // degrees per second, smooth & elegant

    const tickHover = (now: number) => {
      if (!isHoveredRef.current) return

      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      angleRef.current += dt * ROTATION_SPEED
      if (rotatorRef.current) {
        rotatorRef.current.setAttribute(
          'transform',
          `rotate(${angleRef.current.toFixed(2)} 100 100)`
        )
      }

      rafRef.current = requestAnimationFrame(tickHover)
    }

    rafRef.current = requestAnimationFrame(tickHover)
  }

  const startClockwiseReturn = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    const currentAngle = angleRef.current
    const mod = ((currentAngle % 360) + 360) % 360

    // If already virtually at initial orientation, snap cleanly to 0
    if (mod < 0.5 || 360 - mod < 0.5) {
      angleRef.current = 0
      if (rotatorRef.current) {
        rotatorRef.current.setAttribute('transform', 'rotate(0 100 100)')
      }
      return
    }

    // Always rotate CLOCKWISE to the next multiple of 360 (never backwards / anticlockwise)
    let remainingDegrees = 360 - mod
    // If too close to target, add 360deg so momentum has enough space to coast down with organic grace
    if (remainingDegrees < 75) {
      remainingDegrees += 360
    }

    // Naturally calibrated duration for a calm, organic spin-down (850ms - 1280ms)
    const returnDuration = Math.max(820, Math.min(1300, (remainingDegrees / 360) * 520 + 680))
    const startTime = performance.now()

    const tickReturn = (now: number) => {
      // If user re-hovers while returning, seamlessly resume hover spin
      if (isHoveredRef.current) {
        startClockwiseHover()
        return
      }

      const elapsed = now - startTime
      const t = Math.min(1, elapsed / returnDuration)
      // Organic sinusoidal ease-out deceleration (smooth momentum coast-down)
      const eased = Math.sin((t * Math.PI) / 2)

      const nextAngle = currentAngle + remainingDegrees * eased
      angleRef.current = nextAngle

      if (rotatorRef.current) {
        rotatorRef.current.setAttribute(
          'transform',
          `rotate(${nextAngle.toFixed(2)} 100 100)`
        )
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickReturn)
      } else {
        // Return complete: 360deg is identical to 0deg, normalize seamlessly
        angleRef.current = 0
        if (rotatorRef.current) {
          rotatorRef.current.setAttribute('transform', 'rotate(0 100 100)')
        }
      }
    }

    rafRef.current = requestAnimationFrame(tickReturn)
  }

  const handleMouseEnter = () => {
    isHoveredRef.current = true
    onHover(index)
    startClockwiseHover()
  }

  const handleMouseLeave = () => {
    isHoveredRef.current = false
    onLeave()
    startClockwiseReturn()
  }

  // Calculate dynamic transform for smooth expansion & outward shift of other cards
  let cardTransform: string | undefined = undefined
  let cardZIndex: number | undefined = undefined
  let stateClass = ''

  if (hoveredIndex !== null) {
    if (hoveredIndex === index) {
      stateClass = 'is-hovered'
      cardTransform = 'translateY(-12px) scale(1.09)'
      cardZIndex = 12
    } else if (index < hoveredIndex) {
      stateClass = 'shift-left'
      const dist = hoveredIndex - index
      const shiftX = -(22 + (dist - 1) * 4)
      cardTransform = `translateX(${shiftX}px)`
      cardZIndex = 1
    } else {
      stateClass = 'shift-right'
      const dist = index - hoveredIndex
      const shiftX = 22 + (dist - 1) * 4
      cardTransform = `translateX(${shiftX}px)`
      cardZIndex = 1
    }
  }

  return (
    <div
      className={`htc-step ${stateClass}`}
      style={{
        transform: cardTransform,
        zIndex: cardZIndex,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="htc-ring-wrap">
        {/* Ambient atmospheric radial glow that softly melts into the dark background */}
        <div className="htc-ambient-glow" aria-hidden="true" />

        <svg
          className="htc-ring-svg"
          viewBox="0 0 200 200"
          style={{ overflow: 'visible' }}
        >
          <circle className="htc-ring-track" cx="100" cy="100" r="90" />
          <g
            ref={rotatorRef}
            className="htc-ring-rotator"
            transform="rotate(0 100 100)"
          >
            <circle
              className={`htc-ring-arc ${step.arcClass}`}
              cx="100"
              cy="100"
              r="90"
            />
            {step.dots.map((dot, dIdx) => (
              <circle
                key={dIdx}
                className={`htc-glow-dot ${dot.cls}`}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
              />
            ))}
          </g>
        </svg>
        <div className="htc-inner-content">
          <span className="htc-step-num">{step.num}</span>
          <h3 className="htc-step-title">{step.title}</h3>
        </div>
      </div>
      <p className="htc-step-desc">{step.desc}</p>
    </div>
  )
}

export function ComplaintWorkflowSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  const steps: StepData[] = [
    {
      num: '01',
      title: 'SELECT ISSUE',
      desc: "Choose what's wrong — AC, Electrical, Plumbing, Furniture, Wi-Fi, or Other.",
      arcClass: '',
      dots: [
        { cx: 100, cy: 10, r: 4, cls: 'htc-glow-1' },
        { cx: 10, cy: 100, r: 3, cls: 'htc-glow-2' },
        { cx: 190, cy: 100, r: 3, cls: 'htc-glow-3' },
      ],
    },
    {
      num: '02',
      title: 'ADD DETAILS',
      desc: 'Describe the problem and upload a photo/video if needed.',
      arcClass: 'htc-arc-2',
      dots: [
        { cx: 100, cy: 10, r: 4, cls: 'htc-glow-1' },
        { cx: 190, cy: 100, r: 3, cls: 'htc-glow-2' },
        { cx: 100, cy: 190, r: 3, cls: 'htc-glow-3' },
      ],
    },
    {
      num: '03',
      title: 'ADD LOCATION',
      desc: 'Select your building, floor, room/lab, or exact location.',
      arcClass: 'htc-arc-3',
      dots: [
        { cx: 190, cy: 100, r: 4, cls: 'htc-glow-1' },
        { cx: 10, cy: 100, r: 3, cls: 'htc-glow-2' },
        { cx: 100, cy: 10, r: 3, cls: 'htc-glow-3' },
      ],
    },
    {
      num: '04',
      title: 'SUBMIT REQUEST',
      desc: 'Review the details and submit your maintenance request.',
      arcClass: 'htc-arc-4',
      dots: [
        { cx: 100, cy: 190, r: 4, cls: 'htc-glow-1' },
        { cx: 190, cy: 100, r: 3, cls: 'htc-glow-2' },
        { cx: 10, cy: 100, r: 3, cls: 'htc-glow-3' },
      ],
    },
    {
      num: '05',
      title: 'TRACK & RESOLVE',
      desc: 'Get a request ID, track the status, and receive updates until the issue is resolved.',
      arcClass: 'htc-arc-5',
      dots: [
        { cx: 10, cy: 100, r: 4, cls: 'htc-glow-1' },
        { cx: 100, cy: 190, r: 3, cls: 'htc-glow-2' },
        { cx: 100, cy: 10, r: 3, cls: 'htc-glow-3' },
      ],
    },
  ]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const check = () => {
      const rect = el.getBoundingClientRect()
      if (rect.top <= window.innerHeight * 0.88) {
        setIsVisible(true)
      }
    }
    check()

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className={`how-to-section ${isVisible ? 'is-visible' : ''}`}>
      <div className={`how-to-header ${isVisible ? 'is-visible' : ''}`}>
        <p className="how-to-eyebrow">YOUR COMPLAINT WORKFLOW</p>
        <h2>
          Raise a <span className="text-red-highlight">Complaint</span> in 5 Steps
        </h2>
        <p className="how-to-sub">
          From spotting a fault to getting it fixed — here's exactly how the Unicare pipeline works for you.
        </p>
      </div>

      <div
        className={`how-to-steps-v2 ${isVisible ? 'is-visible' : ''}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {steps.map((step, idx) => (
          <WorkflowStepCard
            key={step.num}
            step={step}
            index={idx}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
            onLeave={() => setHoveredIndex(null)}
          />
        ))}
      </div>
    </section>
  )
}
