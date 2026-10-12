import React, { useEffect, useRef } from 'react'

interface DotMatrixWaveProps {
  theme: 'dark' | 'light'
  className?: string
}

export const DotMatrixWave: React.FC<DotMatrixWaveProps> = ({ theme, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    let isVisible = true
    let width = 0
    let height = 0
    let mouseX = -1000
    let mouseY = -1000
    let targetMouseX = -1000
    let targetMouseY = -1000

    const updateDimensions = () => {
      const parent = canvas.parentElement
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      
      width = Math.max(rect.width, 320)
      height = Math.max(rect.height, 400)
      
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    updateDimensions()

    const handleResize = () => {
      updateDimensions()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouseX = e.clientX - rect.left
      targetMouseY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      targetMouseX = -1000
      targetMouseY = -1000
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Pause when scrolled off screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(canvas)

    let startTime = performance.now()

    const render = (now: number) => {
      animId = requestAnimationFrame(render)
      if (!isVisible) return

      const elapsed = (now - startTime) * 0.001

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.08
      mouseY += (targetMouseY - mouseY) * 0.08

      ctx.clearRect(0, 0, width, height)

      // Spacing configuration (adaptive for resolution)
      const stepX = width < 768 ? 16 : 14
      const stepY = width < 768 ? 16 : 14

      const cols = Math.ceil(width / stepX) + 2
      const rows = Math.ceil(height / stepY) + 2

      const isDark = theme === 'dark'

      // Wave Ribbon Centers
      // 3 flowing undulating ribbon layers across the vertical canvas space
      const ribbon1Base = height * 0.22
      const ribbon2Base = height * 0.50
      const ribbon3Base = height * 0.78

      // Amplitude scalers
      const amp1 = Math.min(height * 0.12, 50)
      const amp2 = Math.min(height * 0.14, 60)
      const amp3 = Math.min(height * 0.11, 46)

      for (let r = 0; r < rows; r++) {
        const rawY = r * stepY

        for (let c = 0; c < cols; c++) {
          const rawX = c * stepX

          // Wave Ribbon Equations for this column X
          const wave1Y = ribbon1Base +
            Math.sin(rawX * 0.0034 + elapsed * 0.75) * amp1 +
            Math.cos(rawX * 0.0062 - elapsed * 0.42) * (amp1 * 0.5)

          const wave2Y = ribbon2Base +
            Math.sin(rawX * 0.0028 - elapsed * 0.62 + 1.4) * amp2 +
            Math.sin(rawX * 0.0052 + elapsed * 0.54) * (amp2 * 0.45)

          const wave3Y = ribbon3Base +
            Math.cos(rawX * 0.0036 + elapsed * 0.82 + 2.7) * amp3 +
            Math.sin(rawX * 0.0058 - elapsed * 0.38) * (amp3 * 0.55)

          // Distances to wave ribbon centers
          const d1 = Math.abs(rawY - wave1Y)
          const d2 = Math.abs(rawY - wave2Y)
          const d3 = Math.abs(rawY - wave3Y)

          // Gaussian ribbon widths
          const sigma1 = 38
          const sigma2 = 44
          const sigma3 = 40

          // Intensity of each ribbon
          const i1 = Math.exp(-(d1 * d1) / (2 * sigma1 * sigma1))
          const i2 = Math.exp(-(d2 * d2) / (2 * sigma2 * sigma2))
          const i3 = Math.exp(-(d3 * d3) / (2 * sigma3 * sigma3))

          const maxI = Math.max(i1, i2, i3)

          // Vertical displacement (waves physically warp the dot grid slightly)
          let waveDispY = 0
          if (maxI > 0.05) {
            if (i1 >= i2 && i1 >= i3) {
              waveDispY = Math.sin(rawX * 0.004 + elapsed * 0.7) * (i1 * 7)
            } else if (i2 >= i1 && i2 >= i3) {
              waveDispY = Math.cos(rawX * 0.003 - elapsed * 0.6) * (i2 * 8)
            } else {
              waveDispY = Math.sin(rawX * 0.0045 + elapsed * 0.8) * (i3 * 6)
            }
          }

          let drawX = rawX
          let drawY = rawY + waveDispY

          // Mouse interaction (gentle radial push)
          if (mouseX > -500) {
            const dx = drawX - mouseX
            const dy = drawY - mouseY
            const mouseDist = Math.sqrt(dx * dx + dy * dy)
            const maxMouseDist = 180
            if (mouseDist < maxMouseDist && mouseDist > 0) {
              const push = (1 - mouseDist / maxMouseDist) * 14
              drawX += (dx / mouseDist) * push
              drawY += (dy / mouseDist) * push
            }
          }

          // Halftone radius calculation
          let radius: number
          let fillStyle: string

          if (isDark) {
            // Pitch Black & Crimson Red Theme Palette
            // Ribbons: #ef4444 (bright red), #dc2626 (crimson), #f87171 (scarlet peak)
            if (maxI > 0.08) {
              // Halftone scaling: 1.3px up to 3.8px
              radius = 1.3 + maxI * 2.5

              // Top ribbon: Scarlet & Crimson highlights (#f87171 to #ef4444)
              // Middle ribbon: Pure Crimson & Scarlet (#ef4444 to #dc2626)
              // Lower ribbon: Deep Crimson & Carmine (#dc2626 to #b91c1c)
              if (i1 >= i2 && i1 >= i3) {
                // Top Ribbon
                const alpha = Math.min(0.25 + i1 * 0.75, 1)
                if (i1 > 0.75) {
                  fillStyle = `rgba(254, 202, 202, ${alpha})` // Light coral/white shimmer on peak crest
                } else if (i1 > 0.4) {
                  fillStyle = `rgba(248, 113, 113, ${alpha})` // Neon scarlet
                } else {
                  fillStyle = `rgba(239, 68, 68, ${alpha})` // Bright red
                }
              } else if (i2 >= i1 && i2 >= i3) {
                // Middle Ribbon
                const alpha = Math.min(0.22 + i2 * 0.78, 1)
                if (i2 > 0.78) {
                  fillStyle = `rgba(254, 226, 226, ${alpha})` // Bright highlight
                } else if (i2 > 0.4) {
                  fillStyle = `rgba(239, 68, 68, ${alpha})` // Brand bright red
                } else {
                  fillStyle = `rgba(220, 38, 38, ${alpha})` // Brand crimson
                }
              } else {
                // Lower Ribbon
                const alpha = Math.min(0.2 + i3 * 0.75, 1)
                if (i3 > 0.6) {
                  fillStyle = `rgba(239, 68, 68, ${alpha})`
                } else {
                  fillStyle = `rgba(185, 28, 28, ${alpha})` // Carmine
                }
              }
            } else {
              // Ambient faint background grid dots
              radius = 1.05
              fillStyle = 'rgba(161, 161, 170, 0.12)' // Subtle slate metallic dot
            }
          } else {
            // Light Theme Palette: Crisp white base with Crimson Red & Slate halftone
            if (maxI > 0.08) {
              radius = 1.2 + maxI * 2.6

              if (i1 >= i2 && i1 >= i3) {
                const alpha = Math.min(0.3 + i1 * 0.7, 0.95)
                fillStyle = i1 > 0.6 ? `rgba(220, 38, 38, ${alpha})` : `rgba(239, 68, 68, ${alpha})`
              } else if (i2 >= i1 && i2 >= i3) {
                const alpha = Math.min(0.28 + i2 * 0.72, 0.95)
                fillStyle = i2 > 0.6 ? `rgba(185, 28, 28, ${alpha})` : `rgba(220, 38, 38, ${alpha})`
              } else {
                const alpha = Math.min(0.25 + i3 * 0.7, 0.9)
                fillStyle = `rgba(153, 27, 27, ${alpha})`
              }
            } else {
              radius = 0.95
              fillStyle = 'rgba(100, 116, 139, 0.16)' // Soft slate halftone dot
            }
          }

          // Draw individual dot
          ctx.beginPath()
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2)
          ctx.fillStyle = fillStyle
          ctx.fill()
        }
      }
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      observer.disconnect()
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className={`dot-matrix-wave-canvas ${className}`}
      aria-hidden="true"
    />
  )
}

export default DotMatrixWave
