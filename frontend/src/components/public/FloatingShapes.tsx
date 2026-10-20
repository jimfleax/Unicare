import React, { useEffect, useRef } from 'react'

interface FloatingShapesProps {
  theme: 'dark' | 'light'
  className?: string
}

/**
 * Decorative floating shapes background — large soft circles, small geometric
 * accents (brackets, dots, rings) inspired by theuniques.in aesthetic.
 * Shapes are spread across the full page height (~5000px+).
 */
export const FloatingShapes: React.FC<FloatingShapesProps> = ({ theme, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Subtle parallax drift on mouse move
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      targetX = (e.clientX - cx) / cx
      targetY = (e.clientY - cy) / cy
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.04
      currentY += (targetY - currentY) * 0.04

      const shapes = container.querySelectorAll<HTMLElement>('.fs-shape')
      shapes.forEach((el) => {
        const depth = parseFloat(el.dataset.depth || '1')
        const tx = currentX * depth * 18
        const ty = currentY * depth * 18
        el.style.transform = `translate(${tx}px, ${ty}px)`
      })

      rafId = requestAnimationFrame(tick)
    }

    const mq = window.matchMedia('(hover: hover)')
    if (mq.matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      rafId = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const isDark = theme === 'dark'

  // Colour tokens
  const c1 = isDark ? 'rgba(220, 38, 38, 0.06)' : 'rgba(220, 38, 38, 0.08)'
  const c2 = isDark ? 'rgba(239, 68, 68, 0.09)' : 'rgba(220, 38, 38, 0.11)'
  const c3 = isDark ? 'rgba(185, 28, 28, 0.07)' : 'rgba(185, 28, 28, 0.09)'
  const stroke = isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(220, 38, 38, 0.22)'
  const strokeLight = isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.15)'
  const dot = isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(220, 38, 38, 0.28)'
  const dotLight = isDark ? 'rgba(239, 68, 68, 0.14)' : 'rgba(220, 38, 38, 0.18)'
  const ring = isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(220, 38, 38, 0.16)'

  /* Helper: bracket SVG */
  const Bracket = ({ style, depth, flip }: { style: React.CSSProperties; depth: string; flip?: boolean }) => (
    <svg
      className="fs-shape fs-accent"
      data-depth={depth}
      width="36" height="56" viewBox="0 0 36 56"
      style={{ ...style, ...(flip ? { transform: 'scaleX(-1)' } : {}) }}
    >
      <path d="M28 4 C12 4, 6 14, 6 28 C6 42, 12 52, 28 52" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )

  /* Helper: quote SVG */
  const Quote = ({ style, depth, rotate }: { style: React.CSSProperties; depth: string; rotate?: boolean }) => (
    <svg
      className="fs-shape fs-accent"
      data-depth={depth}
      width="32" height="28" viewBox="0 0 32 28"
      style={{ ...style, ...(rotate ? { transform: 'rotate(180deg)' } : {}) }}
    >
      <path d="M4 18 C4 10, 8 6, 14 6 M18 18 C18 10, 22 6, 28 6" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )

  /* Helper: plus/cross SVG */
  const Plus = ({ style, depth }: { style: React.CSSProperties; depth: string }) => (
    <svg className="fs-shape fs-accent" data-depth={depth} width="20" height="20" viewBox="0 0 20 20" style={style}>
      <line x1="10" y1="2" x2="10" y2="18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="10" x2="18" y2="10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  /* Helper: dashed arc SVG */
  const DashedArc = ({ style, depth, size = 80 }: { style: React.CSSProperties; depth: string; size?: number }) => (
    <svg className="fs-shape fs-accent fs-spin-slow" data-depth={depth} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
      <circle cx={size / 2} cy={size / 2} r={size * 0.4} fill="none" stroke={strokeLight} strokeWidth="1.5" strokeDasharray="8 12" strokeLinecap="round" />
    </svg>
  )

  /* Helper: small X shape SVG */
  const XMark = ({ style, depth }: { style: React.CSSProperties; depth: string }) => (
    <svg className="fs-shape fs-accent" data-depth={depth} width="16" height="16" viewBox="0 0 16 16" style={style}>
      <line x1="3" y1="3" x2="13" y2="13" stroke={strokeLight} strokeWidth="2" strokeLinecap="round" />
      <line x1="13" y1="3" x2="3" y2="13" stroke={strokeLight} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  /* Helper: diamond SVG */
  const Diamond = ({ style, depth }: { style: React.CSSProperties; depth: string }) => (
    <svg className="fs-shape fs-accent" data-depth={depth} width="18" height="18" viewBox="0 0 18 18" style={style}>
      <rect x="4" y="4" width="10" height="10" fill="none" stroke={strokeLight} strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 9 9)" />
    </svg>
  )

  /* Helper: zigzag/wave line SVG */
  const ZigZag = ({ style, depth }: { style: React.CSSProperties; depth: string }) => (
    <svg className="fs-shape fs-accent" data-depth={depth} width="48" height="16" viewBox="0 0 48 16" style={style}>
      <polyline points="2,12 10,4 18,12 26,4 34,12 42,4" fill="none" stroke={strokeLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div ref={containerRef} className={`floating-shapes-bg ${className}`} aria-hidden="true">

      {/* ═══════════════════════════════════════════
          ZONE 1: Hero area (0 – 900px)
          ═══════════════════════════════════════════ */}

      {/* XL circle, top-right, partially off-screen */}
      <div className="fs-shape fs-circle fs-circle--xl" data-depth="0.6"
        style={{ background: c1, width: '520px', height: '520px', top: '-120px', right: '-160px' }} />

      {/* Medium circle, left side */}
      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.5"
        style={{ background: c2, width: '180px', height: '180px', top: '80px', left: '-60px' }} />

      {/* Small accent ring top */}
      <div className="fs-shape fs-ring" data-depth="1.3"
        style={{ border: `2px solid ${ring}`, width: '64px', height: '64px', top: '140px', right: '18%' }} />

      {/* Quote marks near hero text */}
      <Quote style={{ top: '200px', right: '32%' }} depth="2.2" />
      <Quote style={{ top: '420px', left: '6%' }} depth="1.6" rotate />

      {/* Dots in hero */}
      <div className="fs-shape fs-dot" data-depth="2.5" style={{ background: dot, top: '320px', left: '48%' }} />
      <div className="fs-shape fs-dot" data-depth="1.8" style={{ background: dotLight, top: '180px', left: '28%' }} />

      {/* Bracket near hero right */}
      <Bracket style={{ top: '300px', right: '8%' }} depth="1.4" flip />

      {/* Plus mark */}
      <Plus style={{ top: '500px', left: '15%' }} depth="2.4" />

      {/* Diamond accent */}
      <Diamond style={{ top: '260px', left: '42%' }} depth="2.0" />


      {/* ═══════════════════════════════════════════
          ZONE 2: Features / cards area (900 – 2000px)
          ═══════════════════════════════════════════ */}

      {/* Large circle, bottom-left of features */}
      <div className="fs-shape fs-circle fs-circle--lg" data-depth="1.0"
        style={{ background: c2, width: '400px', height: '400px', top: '850px', left: '-180px' }} />

      {/* Medium circle, right edge */}
      <div className="fs-shape fs-circle fs-circle--md" data-depth="0.8"
        style={{ background: c1, width: '320px', height: '320px', top: '1100px', right: '-120px' }} />

      {/* Small circle mid-left */}
      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.6"
        style={{ background: c3, width: '140px', height: '140px', top: '1400px', left: '8%' }} />

      {/* Tiny circle among cards */}
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="2.0"
        style={{ background: c2, width: '90px', height: '90px', top: '1050px', right: '25%' }} />

      {/* Dashed spinning arc */}
      <DashedArc style={{ top: '1000px', right: '6%' }} depth="1.1" />

      {/* Bracket pair */}
      <Bracket style={{ top: '950px', left: '5%' }} depth="1.8" />
      <Bracket style={{ top: '1350px', right: '12%' }} depth="1.4" flip />

      {/* Plus marks */}
      <Plus style={{ top: '1200px', left: '35%' }} depth="2.2" />
      <Plus style={{ top: '1550px', right: '30%' }} depth="1.9" />

      {/* Ring outlines */}
      <div className="fs-shape fs-ring" data-depth="1.7"
        style={{ border: `2px solid ${ring}`, width: '44px', height: '44px', top: '1300px', left: '28%' }} />
      <div className="fs-shape fs-ring" data-depth="1.2"
        style={{ border: `2px solid ${ring}`, width: '56px', height: '56px', top: '1100px', left: '60%' }} />

      {/* Dots */}
      <div className="fs-shape fs-dot" data-depth="2.0" style={{ background: dot, top: '1150px', left: '18%' }} />
      <div className="fs-shape fs-dot fs-dot--lg" data-depth="1.8" style={{ background: dotLight, top: '1500px', right: '18%' }} />
      <div className="fs-shape fs-dot" data-depth="2.3" style={{ background: dot, top: '980px', left: '72%' }} />

      {/* X marks */}
      <XMark style={{ top: '1250px', right: '42%' }} depth="2.1" />

      {/* ZigZag */}
      <ZigZag style={{ top: '1600px', left: '25%' }} depth="1.5" />

      {/* Quotes */}
      <Quote style={{ top: '1450px', right: '8%' }} depth="1.9" />


      {/* ═══════════════════════════════════════════
          ZONE 3: Complaint workflow / routing (2000 – 3200px)
          ═══════════════════════════════════════════ */}

      {/* Large circle right side */}
      <div className="fs-shape fs-circle fs-circle--xl" data-depth="0.7"
        style={{ background: c1, width: '480px', height: '480px', top: '2100px', right: '-200px' }} />

      {/* Medium circle left */}
      <div className="fs-shape fs-circle fs-circle--md" data-depth="1.1"
        style={{ background: c2, width: '260px', height: '260px', top: '2500px', left: '-100px' }} />

      {/* Small circles */}
      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.8"
        style={{ background: c3, width: '120px', height: '120px', top: '2200px', left: '15%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="2.0"
        style={{ background: c2, width: '80px', height: '80px', top: '2800px', right: '20%' }} />

      {/* Dashed arc */}
      <DashedArc style={{ top: '2400px', left: '8%' }} depth="1.3" size={70} />

      {/* Brackets */}
      <Bracket style={{ top: '2150px', left: '42%' }} depth="1.6" />
      <Bracket style={{ top: '2700px', right: '5%' }} depth="1.9" flip />

      {/* Quotes */}
      <Quote style={{ top: '2350px', right: '25%' }} depth="2.0" />
      <Quote style={{ top: '2900px', left: '10%' }} depth="1.7" rotate />

      {/* Plus / X marks */}
      <Plus style={{ top: '2050px', right: '35%' }} depth="2.3" />
      <XMark style={{ top: '2600px', left: '50%' }} depth="1.8" />

      {/* Ring */}
      <div className="fs-shape fs-ring" data-depth="1.5"
        style={{ border: `2px solid ${ring}`, width: '52px', height: '52px', top: '2300px', right: '15%' }} />

      {/* Dots */}
      <div className="fs-shape fs-dot" data-depth="2.2" style={{ background: dot, top: '2050px', left: '65%' }} />
      <div className="fs-shape fs-dot fs-dot--lg" data-depth="1.6" style={{ background: dotLight, top: '2550px', right: '40%' }} />
      <div className="fs-shape fs-dot" data-depth="2.4" style={{ background: dot, top: '2850px', left: '30%' }} />

      {/* Diamond */}
      <Diamond style={{ top: '2750px', right: '32%' }} depth="2.1" />

      {/* ZigZag */}
      <ZigZag style={{ top: '2200px', right: '22%' }} depth="1.4" />


      {/* ═══════════════════════════════════════════
          ZONE 3.5: Smart Routing section (~2800 – 3400px)
          ═══════════════════════════════════════════ */}

      {/* Large circle top-left of Smart Routing */}
      <div className="fs-shape fs-circle fs-circle--lg" data-depth="0.8"
        style={{ background: c2, width: '380px', height: '380px', top: '2850px', left: '-150px' }} />

      {/* Large circle right side Smart Routing */}
      <div className="fs-shape fs-circle fs-circle--xl" data-depth="0.6"
        style={{ background: c1, width: '440px', height: '440px', top: '3100px', right: '-180px' }} />

      {/* Medium circle floating in center-right */}
      <div className="fs-shape fs-circle fs-circle--md" data-depth="1.0"
        style={{ background: c3, width: '220px', height: '220px', top: '2950px', right: '8%' }} />

      {/* Small circles */}
      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.6"
        style={{ background: c2, width: '130px', height: '130px', top: '3050px', left: '10%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="2.0"
        style={{ background: c1, width: '90px', height: '90px', top: '3300px', left: '22%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="1.8"
        style={{ background: c3, width: '75px', height: '75px', top: '2900px', right: '28%' }} />

      {/* Accents for Smart Routing */}
      <Bracket style={{ top: '2880px', left: '4%' }} depth="1.7" />
      <Bracket style={{ top: '3150px', right: '6%' }} depth="1.4" flip />
      <Quote style={{ top: '3000px', right: '30%' }} depth="2.0" />
      <Quote style={{ top: '3250px', left: '15%' }} depth="1.6" rotate />

      <Plus style={{ top: '2920px', left: '45%' }} depth="2.3" />
      <Plus style={{ top: '3200px', right: '42%' }} depth="1.9" />
      <XMark style={{ top: '3080px', left: '62%' }} depth="2.1" />
      <Diamond style={{ top: '3350px', right: '18%' }} depth="1.7" />

      <DashedArc style={{ top: '2960px', right: '3%' }} depth="1.2" size={85} />
      <DashedArc style={{ top: '3280px', left: '5%' }} depth="1.5" size={65} />

      <div className="fs-shape fs-ring" data-depth="1.4"
        style={{ border: `2px solid ${ring}`, width: '55px', height: '55px', top: '3000px', left: '38%' }} />
      <div className="fs-shape fs-ring" data-depth="1.8"
        style={{ border: `2px solid ${ring}`, width: '42px', height: '42px', top: '3180px', right: '22%' }} />

      <div className="fs-shape fs-dot" data-depth="2.2" style={{ background: dot, top: '2870px', left: '55%' }} />
      <div className="fs-shape fs-dot fs-dot--lg" data-depth="1.5" style={{ background: dotLight, top: '3100px', right: '35%' }} />
      <div className="fs-shape fs-dot" data-depth="2.4" style={{ background: dot, top: '3220px', left: '70%' }} />
      <div className="fs-shape fs-dot" data-depth="1.9" style={{ background: dotLight, top: '3350px', right: '50%' }} />

      <ZigZag style={{ top: '3050px', left: '28%' }} depth="1.6" />
      <ZigZag style={{ top: '3300px', right: '15%' }} depth="1.3" />


      {/* ═══════════════════════════════════════════
          ZONE 4: Preventive maintenance / "What happens next" (3400 – 4400px)
          ═══════════════════════════════════════════ */}

      {/* Large circle left, partially off-screen */}
      <div className="fs-shape fs-circle fs-circle--lg" data-depth="0.9"
        style={{ background: c1, width: '420px', height: '420px', top: '3400px', left: '-180px' }} />

      {/* Medium circle right */}
      <div className="fs-shape fs-circle fs-circle--md" data-depth="1.2"
        style={{ background: c3, width: '300px', height: '300px', top: '3700px', right: '-140px' }} />

      {/* Small circles scattered */}
      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.4"
        style={{ background: c2, width: '150px', height: '150px', top: '3250px', right: '12%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="2.2"
        style={{ background: c1, width: '100px', height: '100px', top: '3900px', left: '20%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="1.7"
        style={{ background: c3, width: '70px', height: '70px', top: '4100px', right: '30%' }} />

      {/* Accents */}
      <Bracket style={{ top: '3300px', right: '8%' }} depth="1.5" flip />
      <Bracket style={{ top: '3800px', left: '6%' }} depth="1.8" />
      <Quote style={{ top: '3500px', left: '38%' }} depth="2.0" />
      <Quote style={{ top: '4000px', right: '15%' }} depth="1.6" rotate />

      <Plus style={{ top: '3350px', left: '22%' }} depth="2.1" />
      <Plus style={{ top: '3950px', right: '28%' }} depth="1.9" />
      <XMark style={{ top: '3600px', right: '45%' }} depth="2.3" />
      <Diamond style={{ top: '4050px', left: '55%' }} depth="1.7" />

      <DashedArc style={{ top: '3550px', right: '4%' }} depth="1.0" size={90} />
      <DashedArc style={{ top: '4200px', left: '12%' }} depth="1.4" size={60} />

      <div className="fs-shape fs-ring" data-depth="1.6"
        style={{ border: `2px solid ${ring}`, width: '48px', height: '48px', top: '3450px', left: '68%' }} />
      <div className="fs-shape fs-ring" data-depth="1.3"
        style={{ border: `2px solid ${ring}`, width: '58px', height: '58px', top: '4000px', left: '45%' }} />

      <div className="fs-shape fs-dot" data-depth="2.0" style={{ background: dot, top: '3300px', left: '52%' }} />
      <div className="fs-shape fs-dot fs-dot--lg" data-depth="1.5" style={{ background: dotLight, top: '3750px', right: '22%' }} />
      <div className="fs-shape fs-dot" data-depth="2.4" style={{ background: dot, top: '4150px', right: '55%' }} />

      <ZigZag style={{ top: '3850px', right: '35%' }} depth="1.8" />


      {/* ═══════════════════════════════════════════
          ZONE 5: Footer area (4400 – 5600px)
          ═══════════════════════════════════════════ */}

      <div className="fs-shape fs-circle fs-circle--xl" data-depth="0.5"
        style={{ background: c1, width: '500px', height: '500px', top: '4500px', left: '-200px' }} />

      <div className="fs-shape fs-circle fs-circle--md" data-depth="1.0"
        style={{ background: c2, width: '260px', height: '260px', top: '4800px', right: '-80px' }} />

      <div className="fs-shape fs-circle fs-circle--sm" data-depth="1.6"
        style={{ background: c3, width: '130px', height: '130px', top: '5100px', right: '18%' }} />
      <div className="fs-shape fs-circle fs-circle--xs" data-depth="2.0"
        style={{ background: c2, width: '85px', height: '85px', top: '4600px', left: '35%' }} />

      <Bracket style={{ top: '4550px', right: '10%' }} depth="1.5" />
      <Bracket style={{ top: '5000px', left: '8%' }} depth="1.9" flip />
      <Quote style={{ top: '4700px', left: '55%' }} depth="2.0" />
      <Plus style={{ top: '4900px', right: '38%' }} depth="2.2" />
      <XMark style={{ top: '5200px', left: '40%' }} depth="1.7" />
      <Diamond style={{ top: '4650px', right: '46%' }} depth="2.1" />

      <DashedArc style={{ top: '5050px', right: '6%' }} depth="1.2" />

      <div className="fs-shape fs-ring" data-depth="1.4"
        style={{ border: `2px solid ${ring}`, width: '50px', height: '50px', top: '4850px', left: '22%' }} />

      <div className="fs-shape fs-dot" data-depth="2.3" style={{ background: dot, top: '4750px', right: '30%' }} />
      <div className="fs-shape fs-dot fs-dot--lg" data-depth="1.6" style={{ background: dotLight, top: '5150px', left: '15%' }} />

      <ZigZag style={{ top: '4950px', left: '60%' }} depth="1.5" />

    </div>
  )
}

export default FloatingShapes
