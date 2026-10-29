import React, { useEffect, useRef, useState } from 'react'

interface InteractiveBackgroundProps {
  theme?: 'dark' | 'light'
}

interface ClickRippleItem {
  id: number
  x: number
  y: number
}

export const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [clickRipples, setClickRipples] = useState<ClickRippleItem[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // ── Grid Dimensions (Matching InteractiveGridPattern 40x40 squares) ──
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

    const TRAIL_LIFETIME = 480 // ms lifetime of each trail point
    const TRAIL_RADIUS = 160 // px radius of the grid reveal aura around each point
    let trailPoints: TrailPoint[] = []
    let lastX = -9999
    let lastY = -9999
    let lastMoveTime = 0
    let isMoving = false
    let motionStrength = 0 // 0 = stationary (plain black), 1 = actively moving (grid revealed)

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX
      const y = e.clientY
      const now = performance.now()

      if (lastX > -1000) {
        const dx = x - lastX
        const dy = y - lastY
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Register ONLY if cursor actually moved
        if (dist > 4) {
          isMoving = true
          lastMoveTime = now

          // Interpolate intermediate points for seamless continuous trail
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

      if (trailPoints.length > 70) {
        trailPoints = trailPoints.slice(-70)
      }
    }
    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true })

    // ── Click Ripple Engine ───────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      // Trigger Smooth Wavy Liquid Click Ripple
      const id = Date.now() + Math.random()
      setClickRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setClickRipples((prev) => prev.filter((r) => r.id !== id))
      }, 5200)
    }
    window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true })

    // ── Render Loop ───────────────────────────────────────────────
    let animationFrameId: number
    let isTabVisible = true

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const isLight = theme === 'light'
    const baseBgColor = isLight ? '#f8fafc' : '#08090c' // Solid dark charcoal black

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render)
      if (!isTabVisible) return

      // 1. Draw solid base background
      ctx.fillStyle = baseBgColor
      ctx.fillRect(0, 0, width, height)

      // Stationary detection: if cursor stopped moving for > 75ms, it is stationary!
      if (now - lastMoveTime > 75) {
        isMoving = false
      }

      // Smooth motion envelope:
      // When moving: ramps up quickly
      // When stationary: plunges to 0 within ~120ms
      if (isMoving) {
        motionStrength = Math.min(1, motionStrength + 0.22)
      } else {
        motionStrength = Math.max(0, motionStrength - 0.14)
      }

      // When stationary, purge trail points completely so zero grid squares are revealed
      if (motionStrength <= 0.01) {
        motionStrength = 0
        trailPoints = []
      } else {
        trailPoints = trailPoints.filter((p) => now - p.time < TRAIL_LIFETIME)
      }

      // 2. Draw Interactive Grid Pattern (Revealed ONLY when in active motion via cursor trail)
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

              // Square Fill (Highlight under cursor, subtle fill on surrounding squares)
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

              // Square Grid Stroke (Crisp stroke matching Magic UI grid lines)
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
      {/* Magic UI Click Ripple Overlay */}
      <div 
        className="interactive-bg-ripple-layer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {clickRipples.map((r) => (
          <div
            key={r.id}
            className="magic-click-ripple"
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
            }}
          >
            {Array.from({ length: 8 }, (_, i) => {
              const size = 180 + i * 75
              const targetOpacity = Math.max(0.08, 0.52 - i * 0.05)
              const animationDelay = `${i * 0.16}s`
              return (
                <div
                  key={i}
                  className="magic-ripple-ring"
                  style={
                    {
                      '--i': i,
                      '--target-opacity': targetOpacity,
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDelay,
                    } as React.CSSProperties
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InteractiveBackground
