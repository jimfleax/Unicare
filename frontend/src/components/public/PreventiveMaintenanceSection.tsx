import React, { useState } from 'react'
import { Terminal, TypingAnimation, AnimatedSpan } from '@/components/ui/terminal'
import { Activity, ShieldAlert, CalendarClock, CheckCircle2 } from 'lucide-react'

interface PreventiveMaintenanceSectionProps {
  theme?: 'dark' | 'light'
}

interface PhaseInfo {
  id: string
  num: string
  title: string
  desc: string
  icon: React.ElementType
}

const PHASES: PhaseInfo[] = [
  {
    id: 'p1',
    num: '01',
    title: 'Detect Patterns',
    desc: 'Repeated complaints around the same asset, zone, or issue flagged proactively.',
    icon: Activity,
  },
  {
    id: 'p2',
    num: '02',
    title: 'Identify Risk',
    desc: 'Recurring component degradation modeled with MTBF risk evaluation.',
    icon: ShieldAlert,
  },
  {
    id: 'p3',
    num: '03',
    title: 'Schedule Maintenance',
    desc: 'Automated work orders dispatched with technician assignment & parts reserved.',
    icon: CalendarClock,
  },
  {
    id: 'p4',
    num: '04',
    title: 'Prevent Downtime',
    desc: 'Zero-interruption proactive servicing with 99.98% verified campus uptime.',
    icon: CheckCircle2,
  },
]

export function PreventiveMaintenanceSection({ theme = 'dark' }: PreventiveMaintenanceSectionProps) {
  const isLight = theme === 'light'
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  return (
    <section id="preventive-maintenance" className="pm-section reveal-on-scroll">
      {/* Background Ambient Glow */}
      <div className="pm-ambient-glow" aria-hidden="true" />

      <div className="pm-container">
        {/* Section Header */}
        <div className="pm-header reveal-fade-up">
          <div className="pm-badge mb-2">
            <span className="pm-badge-icon">●</span> PREVENTIVE INTELLIGENCE
          </div>
          <h2 className="pm-title">
            Preventive <span className="text-red-highlight">Maintenance</span>
          </h2>

          <p className="pm-subtitle">
            Your maintenance system shouldn't wait for something to fail.{' '}
            <span className="text-red-highlight">It should learn from what keeps going wrong.</span>
          </p>
        </div>

        {/* 4 Interactive Phase Component Cards (Aceternity / InfoData Style) */}
        <div className={`pm-phase-cards-row ${isLight ? 'terminal-theme-light' : 'terminal-theme-dark'}`}>
          {PHASES.map((p) => {
            const Icon = p.icon
            const isSelected = selectedPhase === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPhase(isSelected ? null : p.id)}
                className={`pm-phase-tab-card ${isSelected ? 'active' : ''}`}
                title={`Click to filter: Phase ${p.num} ${p.title}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="pm-phase-tab-badge">INFODATA {p.num}</span>
                  <Icon size={16} className={isSelected ? 'text-red-500' : isLight ? 'text-slate-400' : 'text-zinc-500'} />
                </div>
                <div className="pm-phase-tab-title">
                  {p.num} — {p.title}
                </div>
                <div className="pm-phase-tab-desc">
                  {p.desc}
                </div>
              </button>
            )
          })}
        </div>

        {/* macOS Style Terminal Window Card (Magic UI / Aceternity) */}
        <div className="w-full flex justify-center mt-3 mb-8">
          <Terminal theme={theme} title="unicare@diagnostics-daemon — zsh (v2.4)" className="w-full">
            {/* Phase 01: Detect Patterns */}
            {(!selectedPhase || selectedPhase === 'p1') && [
              <TypingAnimation key="p1-cmd" className={isLight ? "terminal-text-cmd-light" : "terminal-text-cmd-dark"}>
                &gt; unicare telemetry scan --detect-patterns --depth 90d
              </TypingAnimation>,
              <AnimatedSpan key="p1-s1" className={isLight ? "terminal-text-info-light" : "terminal-text-info-dark"}>
                <span>[INIT] Ingested 1,420 historical work tickets across 12 campus zones.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p1-s2" className={isLight ? "terminal-text-warn-light" : "terminal-text-warn-dark"}>
                <span>▲ [ANOMALY] Cluster #ANM-8821: Repeated thermal spikes on Main Server UPS (Block C).</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p1-s3" className={isLight ? "terminal-text-success-light" : "terminal-text-success-dark"}>
                <span>✔ Phase 01: Detect Patterns — 1 critical failure pattern flagged.</span>
              </AnimatedSpan>,
            ]}

            {/* Phase 02: Identify Risk */}
            {(!selectedPhase || selectedPhase === 'p2') && [
              <TypingAnimation key="p2-cmd" delay={200} className={isLight ? "terminal-text-cmd-light mt-2" : "terminal-text-cmd-dark mt-2"}>
                &gt; unicare risk-eval --asset UPS-8821 --threshold 0.85
              </TypingAnimation>,
              <AnimatedSpan key="p2-s1" className={isLight ? "terminal-text-muted-light" : "terminal-text-muted-dark"}>
                <span>[CALC] Failure probability modeled: MTBF degradation -42% below baseline.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p2-s2" className={isLight ? "terminal-text-danger-light" : "terminal-text-danger-dark"}>
                <span>✖ [CRITICAL RISK] Imminent component breakdown predicted within 72 hours (Confidence: 98.4%).</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p2-s3" className={isLight ? "terminal-text-success-light" : "terminal-text-success-dark"}>
                <span>✔ Phase 02: Identify Risk — Priority Tier 1 (HIGH_RISK) indexed.</span>
              </AnimatedSpan>,
            ]}

            {/* Phase 03: Schedule Maintenance */}
            {(!selectedPhase || selectedPhase === 'p3') && [
              <TypingAnimation key="p3-cmd" delay={200} className={isLight ? "terminal-text-cmd-light mt-2" : "terminal-text-cmd-dark mt-2"}>
                &gt; unicare dispatch --schedule-maintenance --auto-assign --reserve-parts
              </TypingAnimation>,
              <AnimatedSpan key="p3-s1" className={isLight ? "terminal-text-info-light" : "terminal-text-info-dark"}>
                <span>[DISPATCH] Work Order #WO-2026-9041 created. Matched certified technician: Alex Rivera.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p3-s2" className={isLight ? "terminal-text-muted-light" : "terminal-text-muted-dark"}>
                <span>[INVENTORY] Replacement capacitor module Bay-3 reserved automatically.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p3-s3" className={isLight ? "terminal-text-success-light" : "terminal-text-success-dark"}>
                <span>✔ Phase 03: Schedule Maintenance — Service window confirmed for Tomorrow 09:30 AM.</span>
              </AnimatedSpan>,
            ]}

            {/* Phase 04: Prevent Downtime */}
            {(!selectedPhase || selectedPhase === 'p4') && [
              <TypingAnimation key="p4-cmd" delay={200} className={isLight ? "terminal-text-cmd-light mt-2" : "terminal-text-cmd-dark mt-2"}>
                &gt; unicare audit --verify-uptime --prevent-downtime --report
              </TypingAnimation>,
              <AnimatedSpan key="p4-s1" className={isLight ? "terminal-text-muted-light" : "terminal-text-muted-dark"}>
                <span>[VERIFY] Proactive maintenance completed with zero student or lab interruption.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p4-s2" className={isLight ? "terminal-text-info-light font-medium" : "terminal-text-info-dark font-medium"}>
                <span>[METRICS] Duplicate complaints avoided: 100% | Critical downtime saved: ~4.5 hours.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p4-s3" className={isLight ? "terminal-text-success-light" : "terminal-text-success-dark"}>
                <span>✔ Phase 04: Prevent Downtime — Campus-wide uptime: 99.98% verified.</span>
              </AnimatedSpan>,
              <AnimatedSpan key="p4-s4" className={isLight ? "terminal-text-muted-light text-xs mt-1" : "terminal-text-muted-dark text-xs mt-1"}>
                <span>[SYSTEM] Cycle complete. Telemetry daemon listening for events...</span>
              </AnimatedSpan>,
            ]}
          </Terminal>
        </div>
      </div>
    </section>
  )
}

export default PreventiveMaintenanceSection
