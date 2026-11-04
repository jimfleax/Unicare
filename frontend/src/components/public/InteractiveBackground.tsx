import React, { useEffect, useRef } from 'react'

interface InteractiveBackgroundProps {
  theme?: 'dark' | 'light'
}

interface ClickRipple {
  id: number
  pageX: number
  pageY: number
  progress: number // 0 to 1
  opacity: number
  maxRadius: number
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // ── Grid Dimensions (40x40 squares) ───────────────────────────
    const GRID_WIDTH = 40
    const GRID_HEIGHT = 40

    // ── Sizing & High DPI ─────────────────────────────────────────
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Motion-Activated Cursor Trail Engine ───────────────────────
    interface TrailPoint {
      x: number
      y: number
      time: number
    }

    const TRAIL_LIFETIME = 450
    const TRAIL_RADIUS = 150
    let trailPoints: TrailPoint[] = []
    let lastX = -9999
    let lastY = -9999
    let lastMoveTime = 0
    let isMoving = false
    let motionStrength = 0

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX
      const y = e.clientY
      const now = performance.now()

      if (lastX > -1000) {
        const dx = x - lastX
        const dy = y - lastY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 4) {
          isMoving = true
          lastMoveTime = now

          const steps = Math.min(8, Math.max(1, Math.floor(dist / 14)))
          for (let s = 1; s <= steps; s++) {
            const factor = s / steps
            trailPoints.push({
              x: lastX + dx * factor,
              y: lastY + dy * factor,
              time: now,
            })
          }
          lastX = x
          lastY = y
        }
      } else {
        lastX = x
        lastY = y
        lastMoveTime = now
      }

      if (trailPoints.length > 60) {
        trailPoints = trailPoints.slice(-60)
      }
    }
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })

    // ── Ripple Storage (in Page Coordinates for Sub-Pixel Smooth Scroll) ──
    const activeRipples: ClickRipple[] = []

    const onPointerDown = (e: PointerEvent) => {
      const maxRadius = Math.min(Math.max(width, height) * 0.42, 520)
      activeRipples.push({
        id: performance.now() + Math.random(),
        pageX: e.clientX,
        pageY: e.clientY + window.scrollY,
        progress: 0,
        opacity: 1,
        maxRadius,
      })

      if (activeRipples.length > 5) {
        activeRipples.shift()
      }
    }
    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })

    // ── Scroll Velocity Tracking (Smooth continuous multiplier) ──
    let lastScrollY = window.scrollY
    let lastScrollTime = 0
    let scrollSpeed = 0

    const onScroll = () => {
      const currentScrollY = window.scrollY
      const dy = Math.abs(currentScrollY - lastScrollY)
      lastScrollY = currentScrollY
      lastScrollTime = performance.now()

      // Smoothly elevate scrollSpeed based on scroll momentum (clamped to 1)
      scrollSpeed = Math.min(1, scrollSpeed + Math.min(dy / 20, 0.45) + 0.3)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── Render Loop ───────────────────────────────────────────────
    let animationFrameId: number
    let isTabVisible = true
    let lastFrameTime = performance.now()

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const isLight = theme === 'light'
    const baseBgColor = isLight ? '#f8fafc' : '#08090c'

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render)
      if (!isTabVisible) return

      const dt = Math.min(now - lastFrameTime, 32)
      lastFrameTime = now

      // 1. Draw solid base background
      ctx.fillStyle = baseBgColor
      ctx.fillRect(0, 0, width, height)

      // 2. Continuous Scroll Decay & Speed Multiplier
      // When scrolling stops, smoothly ease scrollSpeed back to 0
      if (now - lastScrollTime > 60) {
        scrollSpeed = Math.max(0, scrollSpeed - dt * 0.0035)
      }

      // Base duration is 1800ms; when scrolling fast, smoothly scales up to ~3.2x speed (~560ms)
      const speedMultiplier = 1.0 + scrollSpeed * 2.2
      const currentDuration = 1800 / speedMultiplier

      // Current exact scroll offset at this display frame
      const currentScrollY = window.scrollY

      // 3. Draw & Advance Liquid Click Ripples
      for (let i = activeRipples.length - 1; i >= 0; i--) {
        const rip = activeRipples[i]
        rip.progress += dt / currentDuration

        // Compute exact viewport position synchronized with this frame's scroll offset
        const drawX = rip.pageX
        const drawY = rip.pageY - currentScrollY

        // Smooth fade-out: rapid rise to full crest in first 8%, then silky smooth power decay
        if (rip.progress < 0.08) {
          rip.opacity = rip.progress / 0.08
        } else {
          const decay = (rip.progress - 0.08) / 0.92
          // Fades faster during scroll, but uses smooth power curve so it NEVER instantly pops off
          const fadeExponent = 1.25 + scrollSpeed * 0.65
          rip.opacity = Math.max(0, Math.pow(1 - decay, fadeExponent))
        }

        if (rip.progress >= 1 || rip.opacity <= 0.004) {
          activeRipples.splice(i, 1)
          continue
        }

        // Viewport culling: skip rendering if off-screen
        if (drawY + rip.maxRadius < -40 || drawY - rip.maxRadius > height + 40) {
          continue
        }

        // Render 4 Concentric Fluid Wave Rings (Optimized for 60/120fps with zero frame drops)
        const numRings = 4
        for (let r = 0; r < numRings; r++) {
          const ringDelay = r * 0.085
          const ringProgress = Math.max(0, Math.min(1, (rip.progress - ringDelay) / (1 - ringDelay)))
          if (ringProgress <= 0 || ringProgress >= 1) continue

          // Natural liquid wave expansion curve (fast initial ripple, natural fluid deceleration)
          const ease = 1 - Math.pow(1 - ringProgress, 2.3)
          const radius = ease * rip.maxRadius * (0.65 + r * 0.11)
          const ringAlpha = rip.opacity * (1 - ringProgress * 0.82) * (1 - r * 0.14)

          if (ringAlpha <= 0.008) continue

          ctx.beginPath()
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2)

          if (isLight) {
            ctx.strokeStyle = `rgba(220, 38, 38, ${ringAlpha * 0.65})`
            ctx.lineWidth = Math.max(1, 2.2 * (1 - ringProgress * 0.55))
            ctx.stroke()
          } else {
            // Main glowing crimson wave crest
            ctx.strokeStyle = `rgba(239, 68, 68, ${ringAlpha * 0.85})`
            ctx.lineWidth = Math.max(1.2, 2.6 * (1 - ringProgress * 0.52))
            ctx.stroke()

            // Specular reflection highlight on primary wave crests
            if (r <= 1 && ringAlpha > 0.05) {
              ctx.beginPath()
              ctx.arc(drawX, drawY, Math.max(1, radius - 1), 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(255, 185, 185, ${ringAlpha * 0.4})`
              ctx.lineWidth = 1.0
              ctx.stroke()
            }
          }
        }
      }

      // 4. Motion-Activated Cursor Trail & Grid Engine
      if (now - lastMoveTime > 75) {
        isMoving = false
      }

      if (isMoving) {
        motionStrength = Math.min(1, motionStrength + 0.22)
      } else {
        motionStrength = Math.max(0, motionStrength - 0.14)
      }

      if (motionStrength <= 0.01) {
        motionStrength = 0
        trailPoints = []
      } else {
        trailPoints = trailPoints.filter((p) => now - p.time < TRAIL_LIFETIME)
      }

      // Draw Interactive Grid Pattern (Revealed ONLY when in active motion via cursor trail)
      const cols = Math.ceil(width / GRID_WIDTH) + 1
      const rows = Math.ceil(height / GRID_HEIGHT) + 1

      if (motionStrength > 0.01 && trailPoints.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        for (let i = 0; i < trailPoints.length; i++) {
          const pt = trailPoints[i]
          if (pt.x < minX) minX = pt.x
          if (pt.x > maxX) maxX = pt.x
          if (pt.y < minY) minY = pt.y
          if (pt.y > maxY) maxY = pt.y
        }

        const minCol = Math.max(0, Math.floor((minX - TRAIL_RADIUS) / GRID_WIDTH))
        const maxCol = Math.min(cols - 1, Math.ceil((maxX + TRAIL_RADIUS) / GRID_WIDTH))
        const minRow = Math.max(0, Math.floor((minY - TRAIL_RADIUS) / GRID_HEIGHT))
        const maxRow = Math.min(rows - 1, Math.ceil((maxY + TRAIL_RADIUS) / GRID_HEIGHT))

        const rSq = TRAIL_RADIUS * TRAIL_RADIUS
        const hoveredCol = Math.floor(lastX / GRID_WIDTH)
        const hoveredRow = Math.floor(lastY / GRID_HEIGHT)

        ctx.lineWidth = 1

        for (let r = minRow; r <= maxRow; r++) {
          const y = r * GRID_HEIGHT
          for (let c = minCol; c <= maxCol; c++) {
            const x = c * GRID_WIDTH
            const cx = x + GRID_WIDTH * 0.5
            const cy = y + GRID_HEIGHT * 0.5

            let maxFactor = 0

            for (let p = 0; p < trailPoints.length; p++) {
              const pt = trailPoints[p]
              const dx = cx - pt.x
              const dy = cy - pt.y
              const distSq = dx * dx + dy * dy
              if (distSq < rSq) {
                const age = (now - pt.time) / TRAIL_LIFETIME
                const intensity = (1 - age) * (1 - age) * motionStrength
                const dist = Math.sqrt(distSq)
                const factor = (1 - dist / TRAIL_RADIUS) * intensity
                if (factor > maxFactor) {
                  maxFactor = factor
                }
              }
            }

            if (maxFactor > 0.02) {
              const isHovered = isMoving && c === hoveredCol && r === hoveredRow

              // Square Fill
              if (isHovered) {
                ctx.fillStyle = isLight
                  ? 'rgba(220, 38, 38, 0.20)'
                  : 'rgba(239, 68, 68, 0.26)'
                ctx.fillRect(x, y, GRID_WIDTH, GRID_HEIGHT)
              } else if (maxFactor > 0.12) {
                const fillAlpha = (maxFactor - 0.12) * 0.16
                ctx.fillStyle = isLight
                  ? `rgba(220, 38, 38, ${fillAlpha})`
                  : `rgba(239, 68, 68, ${fillAlpha * 1.2})`
                ctx.fillRect(x, y, GRID_WIDTH, GRID_HEIGHT)
              }

              // Square Grid Stroke
              const strokeAlpha = Math.min(0.65, maxFactor * (isHovered ? 0.75 : 0.45))
              ctx.strokeStyle = isLight
                ? (isHovered ? 'rgba(220, 38, 38, 0.65)' : `rgba(15, 23, 42, ${strokeAlpha * 0.5})`)
                : (isHovered ? 'rgba(255, 120, 120, 0.75)' : `rgba(255, 255, 255, ${strokeAlpha * 0.45})`)

              ctx.strokeRect(x + 0.5, y + 0.5, GRID_WIDTH, GRID_HEIGHT)
            }
          }
        }
      }
    }

    animationFrameId = requestAnimationFrame(render)

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [theme])

  return (
    <div
      className="interactive-bg-root"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="interactive-bg-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          display: 'block',
        }}
      />
    </div>
  )
}

export default InteractiveBackground
