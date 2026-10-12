import { useState } from 'react'
import {
  Search, MapPin, UserCheck, AlertTriangle,
  ClipboardList, Cpu, Radio, ShieldCheck
} from 'lucide-react'

export function SmartRoutingSection() {
  const [activeStage, setActiveStage] = useState<number | null>(null)

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

  return (
    <section className="smart-routing-section reveal-on-scroll">
      <div className="smart-routing-container">

        {/* Header */}
        <div className="smart-routing-header">
          <h2 className="smart-routing-title">Smart <span className="text-red-highlight">Routing</span></h2>
          <p className="smart-routing-subtitle">
            THE RIGHT ISSUE. <span className="text-red-highlight">THE RIGHT PERSON.</span>
          </p>
          <p className="smart-routing-desc">
            Every report is automatically categorized, prioritized, and routed to the appropriate maintenance team so issues reach the people who can actually fix them.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="sr-timeline">
          {/* Central vertical line */}
          <div className="sr-timeline-line" />

          {stages.map((stage, idx) => {
            const Icon = stage.icon
            const isActive = activeStage === idx
            const isEven = idx % 2 === 0 // even = right content, odd = left content

            return (
              <div
                key={stage.num}
                className={`sr-timeline-row ${isEven ? 'sr-row-right' : 'sr-row-left'} ${isActive ? 'sr-row-active' : ''}`}
                onMouseEnter={() => setActiveStage(idx)}
                onMouseLeave={() => setActiveStage(null)}
              >
                {/* Content card */}
                <div className="sr-timeline-card">
                  <div className="sr-card-label">{stage.label}</div>
                  <h3 className="sr-card-question">{stage.question}</h3>
                  <p className="sr-card-desc">{stage.desc}</p>
                </div>

                {/* Center connector: circle with icon + number */}
                <div className="sr-timeline-center">
                  <div className={`sr-timeline-node ${isActive ? 'sr-node-active' : ''}`}>
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

          {/* Conclusion connector */}
          <div className="sr-timeline-conclusion-connector">
            <div className="sr-conclusion-dot" />
            <div className="sr-conclusion-arrow" />
          </div>

          {/* Conclusion box – not part of the process */}
          <div className="sr-timeline-conclusion">
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
        <div className="whn-header">
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
                className={`whn-row whn-row-${step.side} reveal-scale delay-${idx + 1}`}
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
