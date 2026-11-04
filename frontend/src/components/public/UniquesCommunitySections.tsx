import React, { useState, useEffect, useRef, Fragment } from 'react'
import { motion } from 'motion/react'
import {
  Search, MapPin, UserCheck, AlertTriangle,
  ClipboardList, Cpu, Radio, ShieldCheck
} from 'lucide-react'
import HowItWorks, { type Step } from '@/components/ui/how-it-works'

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
}

export function WhatHappensNextSection() {
  const steps = [
    {
      num: '01',
      title: 'Your Report Is Logged',
      description:
        'Your issue, location, description, and attached media are recorded and given a unique request ID.',
      icon: ClipboardList,
    },
    {
      num: '02',
      title: 'The Issue Is Analyzed',
      description:
        'The system identifies the issue category, severity, and required service.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'The Right Technician Is Found',
      description:
        'The request is matched with an available technician based on expertise, location, and workload.',
      icon: UserCheck,
    },
    {
      num: '04',
      title: 'You Get Real-Time Updates',
      description:
        'Track your request as it moves through Assigned → In Progress → Resolved.',
      icon: Radio,
    },
    {
      num: '05',
      title: 'Resolution Is Confirmed',
      description:
        'Once the work is completed, the issue is marked resolved and the requester can verify the fix.',
      icon: ShieldCheck,
    },
  ];

  // State for which cards are revealed and which card is currently centered
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false, false, false]);
  const [centerCardIdx, setCenterCardIdx] = useState<number | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const maskPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const mobileMaskPathsRef = useRef<(SVGPathElement | null)[]>([]);
  const arrowsRef = useRef<(SVGPathElement | null)[]>([]);
  const mobileArrowsRef = useRef<(SVGPathElement | null)[]>([]);

  const maxPathProgressRef = useRef<number[]>([0, 0, 0, 0]);
  const revealedRef = useRef<boolean[]>([false, false, false, false, false]);
  const centerIdxRef = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number;

    const updateScroll = () => {
      const screenH = window.innerHeight;
      // Exact vertical center of viewport where gradual reveals and line connections occur:
      const triggerY = screenH * 0.5;

      let changedReveal = false;

      // 1. Reveal cards as they scroll into the viewport center zone (triggerY + 80px)
      cardRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();

        if (rect.top <= triggerY + 80) {
          if (!revealedRef.current[idx]) {
            revealedRef.current[idx] = true;
            changedReveal = true;
          }
        }
      });

      if (changedReveal) {
        setRevealedCards([...revealedRef.current]);
      }

      // 2. Draw connector paths progressively as user scrolls them through the viewport center
      connectorRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const height = rect.height || 110;

        // How far the connector has traveled through the center of the viewport
        const rawProgress = (triggerY - rect.top) / height;
        const clamped = Math.max(0, Math.min(1, rawProgress));

        // Once drawn by scrolling, maintain progress
        const prev = maxPathProgressRef.current[idx] || 0;
        const progress = Math.max(prev, clamped);
        maxPathProgressRef.current[idx] = progress;

        const offset = 1000 * (1 - progress);

        // Direct hardware-accelerated style update for 120fps smoothness
        const mask = maskPathsRef.current[idx];
        if (mask) {
          mask.style.strokeDashoffset = `${offset}`;
        }
        const mobileMask = mobileMaskPathsRef.current[idx];
        if (mobileMask) {
          mobileMask.style.strokeDashoffset = `${offset}`;
        }

        // Arrowhead pops into place right as the line connects to the target card
        const arrow = arrowsRef.current[idx];
        if (arrow) {
          arrow.style.opacity = progress >= 0.88 ? '1' : '0';
          arrow.style.transform = progress >= 0.88 ? 'scale(1)' : 'scale(0)';
        }
        const mobileArrow = mobileArrowsRef.current[idx];
        if (mobileArrow) {
          mobileArrow.style.opacity = progress >= 0.88 ? '1' : '0';
          mobileArrow.style.transform = progress >= 0.88 ? 'scale(1)' : 'scale(0)';
        }
      });

      // 3. Keep the card closest to the viewport center active and focused
      let closestIdx: number | null = null;
      let closestDist = Infinity;

      cardRefs.current.forEach((el, idx) => {
        if (!el || !revealedRef.current[idx]) return;
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height * 0.5;
        const dist = Math.abs(cardCenter - triggerY);

        if (dist < closestDist && dist < screenH * 0.42) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      if (centerIdxRef.current !== closestIdx) {
        centerIdxRef.current = closestIdx;
        setCenterCardIdx(closestIdx);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    const onResize = () => {
      onScroll();
    };

    updateScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="whn-fluid-section relative py-20 px-4 md:px-8 overflow-hidden bg-transparent">
      {/* Background Crimson Red Ambient Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-red-600/10 dark:bg-red-600/12 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[340px] bg-rose-600/10 dark:bg-rose-600/10 rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="whn-fluid-container max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="whn-header text-center mb-16 md:mb-20">
          <p className="whn-eyebrow text-xs font-bold tracking-[3px] text-red-500 uppercase mb-3 font-display">
            WORKFLOW PIPELINE
          </p>
          <h2 className="whn-title text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 font-display">
            What Happens <span className="text-red-highlight">Next?</span>
          </h2>
          <p className="whn-subtitle text-base md:text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            From initial report to verified completion — here's how every issue travels through our automated resolution engine.
          </p>
        </div>

        {/* Staggered Zigzag Timeline Container */}
        <div className="relative flex flex-col w-full space-y-6 md:space-y-0">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const isLast = index === steps.length - 1;
            const isRevealed = revealedCards[index];
            const isCenter = centerCardIdx === index;

            const connectorD = isEven
              ? "M 235 0 L 235 38 Q 235 50, 248 50 L 752 50 Q 765 50, 765 62 L 765 90"
              : "M 765 0 L 765 38 Q 765 50, 752 50 L 248 50 Q 235 50, 235 62 L 235 90";

            return (
              <Fragment key={step.num}>
                {/* Motion Card Wrapper with Staggered Zigzag Placement */}
                <div
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`w-full md:w-1/2 self-center transition-all duration-700 ease-out ${
                    isEven
                      ? "md:pr-8 md:self-start md:pl-0"
                      : "md:pl-8 md:self-end md:pr-0"
                  }`}
                  style={{
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed
                      ? (isCenter ? "translateY(0) scale(1.02)" : "translateY(0) scale(1)")
                      : "translateY(36px) scale(0.94)",
                    pointerEvents: isRevealed ? "auto" : "none",
                  }}
                >
                  {/* Unicare Crimson Red Design System Card */}
                  <div
                    className={`whn-card backdrop-blur-md rounded-xl flex flex-row items-stretch overflow-hidden ${
                      isCenter ? "is-center-active" : ""
                    }`}
                  >
                    {/* Step Pill (Left Column) */}
                    <div className="shrink-0 flex items-stretch">
                      <div className="w-14 sm:w-16 py-6 bg-gradient-to-b from-red-600 to-rose-700 flex items-center justify-center border-r border-red-500/30 select-none">
                        <span className="text-white font-bold tracking-widest text-xs md:text-sm uppercase transform -rotate-90 whitespace-nowrap origin-center select-none font-display">
                          STEP {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Content Area (Right Column) */}
                    <div className="whn-card-content">
                      <h3 className="whn-card-title font-display">
                        {step.title}
                      </h3>
                      <p className="whn-card-desc">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dotted Connector Lines (Slowly draws and connects as user scrolls) */}
                {!isLast && (
                  <div
                    ref={(el) => {
                      connectorRefs.current[index] = el;
                    }}
                    className="relative w-full"
                  >
                    {/* Desktop Elbow Connector */}
                    <div
                      className="relative w-full h-24 md:h-28 hidden md:block pointer-events-none -my-2"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-full h-full text-red-500 overflow-visible"
                        viewBox="0 0 1000 100"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <mask id={`whn-mask-${index}`}>
                            <path
                              ref={(el) => {
                                maskPathsRef.current[index] = el;
                              }}
                              d={connectorD}
                              fill="none"
                              stroke="white"
                              strokeWidth="16"
                              strokeLinecap="round"
                              pathLength="1000"
                              strokeDasharray="1000"
                              strokeDashoffset="1000"
                            />
                          </mask>
                        </defs>
                        {/* Animated Dotted Elbow Line */}
                        <path
                          d={connectorD}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray="6,6"
                          mask={`url(#whn-mask-${index})`}
                        />
                        {/* Arrowhead at Target Card */}
                        <path
                          ref={(el) => {
                            arrowsRef.current[index] = el;
                          }}
                          d={isEven ? "M 759 82 L 765 92 L 771 82 Z" : "M 229 82 L 235 92 L 241 82 Z"}
                          fill="#ef4444"
                          style={{
                            opacity: 0,
                            transform: "scale(0)",
                            transformOrigin: isEven ? "765px 92px" : "235px 92px",
                            transition: "opacity 0.25s ease, transform 0.25s ease",
                          }}
                        />
                      </svg>
                    </div>

                    {/* Mobile Vertical Connector */}
                    <div
                      className="relative w-full h-14 flex items-center justify-center md:hidden pointer-events-none -my-2"
                      aria-hidden="true"
                    >
                      <svg
                        className="w-8 h-full text-red-500 overflow-visible"
                        viewBox="0 0 32 56"
                      >
                        <defs>
                          <mask id={`whn-mobile-mask-${index}`}>
                            <path
                              ref={(el) => {
                                mobileMaskPathsRef.current[index] = el;
                              }}
                              d="M 16 0 L 16 46"
                              fill="none"
                              stroke="white"
                              strokeWidth="12"
                              strokeLinecap="round"
                              pathLength="1000"
                              strokeDasharray="1000"
                              strokeDashoffset="1000"
                            />
                          </mask>
                        </defs>
                        {/* Animated Vertical Dotted Line */}
                        <path
                          d="M 16 0 L 16 46"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray="5,5"
                          mask={`url(#whn-mobile-mask-${index})`}
                        />
                        {/* Arrowhead pointing down into next card */}
                        <path
                          ref={(el) => {
                            mobileArrowsRef.current[index] = el;
                          }}
                          d="M 11 36 L 16 46 L 21 36 Z"
                          fill="#ef4444"
                          style={{
                            opacity: 0,
                            transform: "scale(0)",
                            transformOrigin: "16px 46px",
                            transition: "opacity 0.25s ease, transform 0.25s ease",
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
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
  const [isSpinning, setIsSpinning] = useState(false)
  const rotatorRef = useRef<SVGGElement | null>(null)
  const rotatorRefBack = useRef<SVGGElement | null>(null)
  const spinnerRef = useRef<HTMLDivElement | null>(null)
  const ambientGlowRef = useRef<HTMLDivElement | null>(null)

  const cardAngleRef = useRef<number>(0)
  const dotAngleRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const isHoveredRef = useRef<boolean>(false)
  const isSpinningRef = useRef<boolean>(false)

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Slow gentle rotation of orbital dots on hover (when not clicked/spinning)
  const startClockwiseHover = () => {
    if (isSpinningRef.current) return
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    let lastTime = performance.now()
    const ROTATION_SPEED = 70 // degrees per second

    const tickHover = (now: number) => {
      if (!isHoveredRef.current || isSpinningRef.current) return

      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      dotAngleRef.current += dt * ROTATION_SPEED
      const rotAttr = `rotate(${dotAngleRef.current.toFixed(2)} 100 100)`
      if (rotatorRef.current) {
        rotatorRef.current.setAttribute('transform', rotAttr)
      }
      if (rotatorRefBack.current) {
        rotatorRefBack.current.setAttribute('transform', rotAttr)
      }

      rafRef.current = requestAnimationFrame(tickHover)
    }

    rafRef.current = requestAnimationFrame(tickHover)
  }

  const startClockwiseReturn = () => {
    if (isSpinningRef.current) return
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    const currentAngle = dotAngleRef.current
    const mod = ((currentAngle % 360) + 360) % 360

    if (mod < 1 || 360 - mod < 1) {
      dotAngleRef.current = 0
      if (rotatorRef.current) {
        rotatorRef.current.setAttribute('transform', 'rotate(0 100 100)')
      }
      if (rotatorRefBack.current) {
        rotatorRefBack.current.setAttribute('transform', 'rotate(0 100 100)')
      }
      return
    }

    let remainingDegrees = 360 - mod
    if (remainingDegrees < 75) {
      remainingDegrees += 360
    }

    const returnDuration = Math.max(700, Math.min(1100, (remainingDegrees / 360) * 480 + 550))
    const startTime = performance.now()

    const tickReturn = (now: number) => {
      if (isHoveredRef.current || isSpinningRef.current) {
        if (!isSpinningRef.current) startClockwiseHover()
        return
      }

      const elapsed = now - startTime
      const t = Math.min(1, elapsed / returnDuration)
      const eased = Math.sin((t * Math.PI) / 2)

      const nextAngle = currentAngle + remainingDegrees * eased
      dotAngleRef.current = nextAngle

      const rotAttr = `rotate(${nextAngle.toFixed(2)} 100 100)`
      if (rotatorRef.current) {
        rotatorRef.current.setAttribute('transform', rotAttr)
      }
      if (rotatorRefBack.current) {
        rotatorRefBack.current.setAttribute('transform', rotAttr)
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickReturn)
      } else {
        dotAngleRef.current = 0
        if (rotatorRef.current) {
          rotatorRef.current.setAttribute('transform', 'rotate(0 100 100)')
        }
        if (rotatorRefBack.current) {
          rotatorRefBack.current.setAttribute('transform', 'rotate(0 100 100)')
        }
      }
    }

    rafRef.current = requestAnimationFrame(tickReturn)
  }

  // Click handler: 3D Horizontal Flip Spin (spinning while flipping horizontally and smoothly returning to itself)
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    isSpinningRef.current = true
    setIsSpinning(true)

    const currentAngle = cardAngleRef.current
    const currentMod = ((currentAngle % 360) + 360) % 360

    // Spin 720 degrees (2 full 360° horizontal flips around Y axis)
    const additionalTurns = 720
    const targetAngle = currentAngle + (360 - currentMod) + additionalTurns
    const totalDelta = targetAngle - currentAngle

    // Calibrated duration for an energetic horizontal flip spin and smooth, graceful coast-down
    const duration = 1200 // 1.2s total
    const startTime = performance.now()

    const tickClickSpin = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)

      // Natural power ease-out curve: explosive initial flip-spin with smooth sinusoidal finish
      const eased = 1 - Math.pow(1 - t, 3.4)

      const nextAngle = currentAngle + totalDelta * eased
      cardAngleRef.current = nextAngle

      // Subtle scale bounce during flip (peaks at 1.08x in the middle of spin)
      const scaleBounce = 1 + 0.08 * Math.sin(t * Math.PI)

      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotateY(${nextAngle.toFixed(2)}deg) scale(${scaleBounce.toFixed(3)})`
      }

      // Dynamic glowing aura boost during spin
      if (ambientGlowRef.current) {
        ambientGlowRef.current.style.opacity = `${(0.4 + 0.6 * Math.sin(t * Math.PI)).toFixed(2)}`
        ambientGlowRef.current.style.transform = `translate(-50%, -50%) scale(${(1 + 0.18 * Math.sin(t * Math.PI)).toFixed(3)})`
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickClickSpin)
      } else {
        // Complete spin: reset cleanly upright at 0deg
        cardAngleRef.current = 0
        isSpinningRef.current = false
        setIsSpinning(false)

        if (spinnerRef.current) {
          spinnerRef.current.style.transform = 'rotateY(0deg) scale(1)'
        }
        if (ambientGlowRef.current) {
          ambientGlowRef.current.style.opacity = ''
          ambientGlowRef.current.style.transform = ''
        }
      }
    }

    rafRef.current = requestAnimationFrame(tickClickSpin)
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
      className={`htc-step ${stateClass} ${isSpinning ? 'is-spinning' : ''}`}
      style={{
        transform: cardTransform,
        zIndex: cardZIndex,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div
        className="htc-ring-wrap"
        title="Click to flip card"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCardClick(e as any)
          }
        }}
      >
        {/* Ambient atmospheric radial glow that softly melts into the dark background */}
        <div ref={ambientGlowRef} className="htc-ambient-glow" aria-hidden="true" />

        {/* 3D Horizontal Flip Spinner */}
        <div ref={spinnerRef} className="htc-flip-spinner">
          {/* FRONT FACE */}
          <div className="htc-card-face htc-card-face-front">
            <div className="htc-face-disc" />
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

          {/* BACK FACE (Double-sided for clean 3D horizontal flip) */}
          <div className="htc-card-face htc-card-face-back">
            <div className="htc-face-disc" />
            <svg
              className="htc-ring-svg"
              viewBox="0 0 200 200"
              style={{ overflow: 'visible' }}
            >
              <circle className="htc-ring-track" cx="100" cy="100" r="90" />
              <g
                ref={rotatorRefBack}
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
      if (rect.top <= window.innerHeight * 0.92) {
        setIsVisible(true)
      }
    }
    check()

    const handleScroll = () => {
      check()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
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
