import { useState } from 'react'
import {
  Search, MapPin, UserCheck, AlertTriangle, Sparkles
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
}

export function WhatHappensNextSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const steps = [
    {
      num: '01',
      title: 'Your Report Is Logged',
      desc: 'Your issue, location, description, and attached media are recorded and given a unique request ID.',

      pinColor: '#dc2626',
      tintBg: 'rgba(220, 38, 38, 0.04)',
    },
    {
      num: '02',
      title: 'The Issue Is Analyzed',
      desc: 'The system identifies the issue category, severity, and required service.',

      pinColor: '#b91c1c',
      tintBg: 'rgba(185, 28, 28, 0.04)',
    },
    {
      num: '03',
      title: 'The Right Technician Is Found',
      desc: 'The request is matched with an available technician based on expertise, location, and workload.',

      pinColor: '#ef4444',
      tintBg: 'rgba(239, 68, 68, 0.05)',
    },
    {
      num: '04',
      title: 'You Get Real-Time Updates',
      desc: 'Track your request as it moves through Assigned → In Progress → Resolved.',

      pinColor: '#dc2626',
      tintBg: 'rgba(220, 38, 38, 0.03)',
    },
    {
      num: '05',
      title: 'Resolution Is Confirmed',
      desc: 'Once the work is completed, the issue is marked resolved and the requester can verify the fix.',

      pinColor: '#b91c1c',
      tintBg: 'rgba(185, 28, 28, 0.04)',
    },
  ]

  /* Pin positions: offset from center-top of each card */
  const pinPositions = ['45%', '60%', '35%', '55%', '40%']
  const rotations = [-2.5, 2, -1.5, 2.5, -2]

  return (
    <section className="whn-section reveal-on-scroll">
      <div className="whn-container">

        {/* Header */}
        <div className="whn-header">
          <p className="whn-eyebrow">THE PROCESS</p>
          <h2 className="whn-title">
            What Happens <span className="text-red-highlight">Next?</span>
          </h2>
          <p className="whn-subtitle">
            From a simple report to a resolved problem.
          </p>
        </div>

        {/* Pinboard Zigzag Flow */}
        <div className="whn-pinboard">

          {/* Dashed connector line (SVG) — positioned absolutely, stretches full height */}
          <svg className="whn-connector-svg" preserveAspectRatio="none" fill="none">
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--whn-dash-color, rgba(160,160,170,0.25))" strokeWidth="1.5" strokeDasharray="6 5" />
          </svg>

          {/* Step Notes */}
          {steps.map((step, idx) => {
            const isActive = activeStep === idx
            const isLeft = idx % 2 === 0
            return (
              <div
                key={step.num}
                className={`whn-note-row ${isLeft ? 'whn-note-left' : 'whn-note-right'} ${isActive ? 'whn-note-active' : ''} reveal-scale delay-${idx + 1}`}
                onMouseEnter={() => setActiveStep(idx)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div
                  className="whn-sticky-note"
                  style={{
                    '--note-rotation': `${rotations[idx]}deg`,
                    '--note-tint': step.tintBg,
                    '--pin-color': step.pinColor,
                    '--pin-left': pinPositions[idx],
                  } as React.CSSProperties}
                >
                  {/* 3D Pushpin */}
                  <div className="whn-pushpin">
                    <div className="whn-pin-needle" />
                    <div className="whn-pin-head">
                      <div className="whn-pin-highlight" />
                    </div>
                    <div className="whn-pin-drop-shadow" />
                  </div>

                  {/* Step Number */}
                  <span className="whn-note-num">{step.num}</span>

                  {/* Title */}
                  <h3 className="whn-note-title">{step.title}</h3>

                  {/* Description */}
                  <p className="whn-note-desc">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
