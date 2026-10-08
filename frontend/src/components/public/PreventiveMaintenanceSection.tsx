import React, { useState } from 'react'
import {
  Monitor, Rocket, BarChart3, Search, Sparkles, ShieldCheck
} from 'lucide-react'

interface StepCard {
  id: string
  stepNum: string
  title: string
  desc: string
  icon: React.ElementType
  color: string
  strokeGradient: [string, string]
  shadowColor: string
  lightShadowColor: string
  bgArcColor: string
}

const stepsData: StepCard[] = [
  {
    id: 'step-01',
    stepNum: '01',
    title: 'Detect Patterns',
    desc: 'Repeated complaints around the same asset, location, or issue type are identified.',
    icon: Monitor,
    color: '#ef4444', // Red / Coral
    strokeGradient: ['#f87171', '#ef4444'],
    shadowColor: 'rgba(239, 68, 68, 0.22)',
    lightShadowColor: 'rgba(220, 38, 38, 0.16)',
    bgArcColor: 'rgba(239, 68, 68, 0.18)',
  },
  {
    id: 'step-02',
    stepNum: '02',
    title: 'Identify Risk',
    desc: 'Recurring failures are flagged as potential maintenance risks.',
    icon: Rocket,
    color: '#f97316', // Orange / Coral
    strokeGradient: ['#fb923c', '#f97316'],
    shadowColor: 'rgba(249, 115, 22, 0.22)',
    lightShadowColor: 'rgba(234, 88, 12, 0.16)',
    bgArcColor: 'rgba(249, 115, 22, 0.18)',
  },
  {
    id: 'step-03',
    stepNum: '03',
    title: 'Schedule Maintenance',
    desc: 'Maintenance teams can inspect or service the affected asset before another breakdown occurs.',
    icon: BarChart3,
    color: '#3b82f6', // Indigo / Blue
    strokeGradient: ['#60a5fa', '#3b82f6'],
    shadowColor: 'rgba(59, 130, 246, 0.22)',
    lightShadowColor: 'rgba(37, 99, 235, 0.16)',
    bgArcColor: 'rgba(59, 130, 246, 0.18)',
  },
  {
    id: 'step-04',
    stepNum: '04',
    title: 'Prevent Downtime',
    desc: 'Problems are addressed proactively instead of waiting for users to report them again.',
    icon: Search,
    color: '#a855f7', // Violet / Purple
    strokeGradient: ['#c084fc', '#a855f7'],
    shadowColor: 'rgba(168, 85, 247, 0.22)',
    lightShadowColor: 'rgba(147, 51, 234, 0.16)',
    bgArcColor: 'rgba(168, 85, 247, 0.18)',
  },
]

export function PreventiveMaintenanceSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <section id="preventive-maintenance" className="pm-section reveal-on-scroll">
      {/* Background Ambient Glow & Vectors */}
      <div className="pm-ambient-glow" aria-hidden="true" />

      <div className="pm-container">
        {/* Section Header */}
        <div className="pm-header">
          <h2 className="pm-title">Preventive Maintenance</h2>

          <p className="pm-subtitle">
            Your maintenance system shouldn't wait for something to fail.{' '}
            <span className="text-red-highlight">It should learn from what keeps going wrong.</span>
          </p>

          <div className="pm-flow-indicator">
            <span className="pm-flow-line" />
            <span className="pm-flow-tag">HOW IT WORKS</span>
            <span className="pm-flow-line" />
          </div>
        </div>

        {/* 4 Infographic Notched Cards with Connected Wire Flow (Matching Reference Image) */}
        <div className="pm-cards-grid">
          {stepsData.map((step, idx) => {
            const Icon = step.icon
            const isHovered = hoveredCard === step.id

            return (
              <div
                key={step.id}
                className={`pm-card-wrapper reveal-scale delay-${idx + 1} ${isHovered ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(step.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* SVG Card Frame: Notched outline, connecting wire, decorative arcs & drop shadow */}
                <svg
                  className="pm-card-svg"
                  viewBox="0 0 280 370"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Dynamic Drop Shadow Filter */}
                    <filter id={`pm-shadow-${step.id}`} x="-15%" y="-15%" width="130%" height="135%">
                      <feDropShadow
                        dx="3"
                        dy="12"
                        stdDeviation="10"
                        floodColor={step.shadowColor}
                        floodOpacity={isHovered ? '0.5' : '0.28'}
                      />
                    </filter>

                    {/* Outer Border Stroke Gradient */}
                    <linearGradient id={`pm-stroke-${step.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={step.strokeGradient[0]} />
                      <stop offset="100%" stopColor={step.strokeGradient[1]} />
                    </linearGradient>

                    {/* Corner Accent Arc Gradient */}
                    <linearGradient id={`pm-arc-grad-${step.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={step.color} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={step.color} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {/* Main Notched Card Body (matches the exact geometry of the reference image) */}
                  <path
                    className="pm-card-path"
                    d="M 42 18
                       L 222 18
                       A 24 24 0 0 1 246 42
                       L 246 70
                       A 6 6 0 0 0 240 76
                       L 220 76
                       A 10 10 0 0 0 220 96
                       L 240 96
                       A 6 6 0 0 0 246 102
                       L 246 296
                       A 24 24 0 0 1 222 320
                       L 78 320
                       A 6 6 0 0 0 72 314
                       L 72 294
                       A 10 10 0 0 0 52 294
                       L 52 314
                       A 6 6 0 0 0 46 320
                       L 42 320
                       A 24 24 0 0 1 18 296
                       L 18 42
                       A 24 24 0 0 1 42 18 Z"
                    stroke={`url(#pm-stroke-${step.id})`}
                    strokeWidth="3.5"
                    filter={`url(#pm-shadow-${step.id})`}
                  />

                  {/* Top-Left Decorative Subtle Arc (matching reference image) */}
                  <path
                    d="M 28 85 A 60 60 0 0 1 85 28"
                    stroke={`url(#pm-arc-grad-${step.id})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Bottom-Right Decorative Subtle Arc (matching reference image) */}
                  <path
                    d="M 175 310 A 60 60 0 0 0 236 250"
                    stroke={`url(#pm-arc-grad-${step.id})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Outer Loop Wire (emerges from top-right notch, loops around right & bottom, enters bottom-left notch) */}
                  <path
                    className="pm-loop-wire"
                    d="M 222 86
                       L 260 86
                       A 12 12 0 0 1 272 98
                       L 272 334
                       A 16 16 0 0 1 256 350
                       L 74 350
                       A 12 12 0 0 1 62 338
                       L 62 292"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Card Content Overlay */}
                <div className="pm-card-content">
                  {/* Top Centered Icon */}
                  <div
                    className="pm-card-icon-wrap"
                    style={{ '--pm-accent': step.color } as React.CSSProperties}
                  >
                    <Icon size={26} color={step.color} className="pm-icon" />
                  </div>

                  {/* Title & Phase Number */}
                  <div className="pm-card-header-text">
                    <span className="pm-card-tag" style={{ color: step.color }}>
                      INFODATA {step.stepNum}
                    </span>
                    <h3 className="pm-card-title">
                      {step.stepNum} — {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="pm-card-desc">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Assurance Note */}
        <div className="pm-bottom-banner">
          <div className="pm-banner-content">
            <div className="pm-banner-icon">
              <ShieldCheck size={20} color="var(--red-bright)" />
            </div>
            <div>
              <strong>Continuous Telemetry &amp; Pattern Intelligence</strong>
              <p>Predictive logs automatically cross-reference historical repairs to safeguard lab equipment uptime.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
