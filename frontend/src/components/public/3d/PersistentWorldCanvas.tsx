import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SceneDirector, type ChapterConfig } from './SceneDirector'

interface PersistentWorldCanvasProps {
  theme?: 'dark' | 'light'
}

export const PersistentWorldCanvas: React.FC<PersistentWorldCanvasProps> = ({ theme = 'dark' }) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // ── Check reduced motion ───────────────────────────────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Scene, Camera & Renderer ───────────────────────────────
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = theme === 'light' ? 1.4 : 1.15
    container.appendChild(renderer.domElement)

    // ── Primary 3D Core Group ───────────────────────────────────
    const worldGroup = new THREE.Group()
    scene.add(worldGroup)

    const coreGroup = new THREE.Group()
    worldGroup.add(coreGroup)

    // 1. Central Crystalline Digital Twin Core
    const coreGeometry = new THREE.IcosahedronGeometry(2.0, 1)
    const coreWireMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
      metalness: 0.9,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreWireMat)
    coreGroup.add(coreMesh)

    // Inner Solid Glow Sphere
    const innerGeo = new THREE.SphereGeometry(1.25, 24, 24)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
      transparent: true,
      opacity: 0.28,
      wireframe: false,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerSphere)

    // Point Light inside the Core
    const corePointLight = new THREE.PointLight(0xef4444, 3.5, 35)
    coreGroup.add(corePointLight)

    // 2. Orbital Tech Rings (Gyroscope gimbal rings)
    const ringGroup = new THREE.Group()
    coreGroup.add(ringGroup)

    const createOrbitalRing = (radius: number, tube: number, color: number, tiltZ: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 8, 80)
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.rotation.z = tiltZ
      return ring
    }

    const ring1 = createOrbitalRing(3.2, 0.02, 0xef4444, 0.2)
    const ring2 = createOrbitalRing(4.1, 0.025, 0xf97316, 0.6)
    const ring3 = createOrbitalRing(5.0, 0.02, 0xdc2626, -0.4)
    ringGroup.add(ring1, ring2, ring3)

    // 3. Ambient Telemetry & Cosmic Particle Field
    const particleCount = 1200
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleScales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // Cylinder/spherical distribution around the campus core
      const radius = 6 + Math.random() * 26
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 28

      particlePositions[i * 3] = radius * Math.cos(theta)
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = radius * Math.sin(theta)

      particleScales[i] = Math.random() * 0.8 + 0.2
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1))

    // Particle texture generator (soft round radial dot)
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
        grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.8)')
        grad.addColorStop(0.7, 'rgba(220, 38, 38, 0.2)')
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 32, 32)
      }
      return new THREE.CanvasTexture(canvas)
    }

    const particleTexture = createParticleTexture()
    const particleMat = new THREE.PointsMaterial({
      color: 0xff6b6b,
      size: 0.45,
      map: particleTexture,
      transparent: true,
      opacity: theme === 'light' ? 0.35 : 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particleSystem = new THREE.Points(particleGeo, particleMat)
    worldGroup.add(particleSystem)

    // 4. Data Routing Spline Curves (Neural facility arcs attached to core)
    const curveGroup = new THREE.Group()
    coreGroup.add(curveGroup)

    const curves: THREE.CatmullRomCurve3[] = []
    const pulseObjects: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; offset: number; speed: number }[] = []

    const numArcs = 5
    for (let a = 0; a < numArcs; a++) {
      const angle = (a / numArcs) * Math.PI * 2
      const reach = 10 + Math.random() * 5
      const pStart = new THREE.Vector3(
        reach * Math.cos(angle),
        (Math.random() - 0.5) * 8,
        reach * Math.sin(angle)
      )
      const pMid = new THREE.Vector3(
        (reach * 0.5) * Math.cos(angle + 0.4),
        Math.random() * 4 + 2,
        (reach * 0.5) * Math.sin(angle + 0.4)
      )
      const pEnd = new THREE.Vector3(0, 0, 0)

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd])
      curves.push(curve)

      // Tube wire arc
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.018, 6, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.22,
        wireframe: true,
      })
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat)
      curveGroup.add(tubeMesh)

      // Light packet traveling on spline
      const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12)
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
      })
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat)
      curveGroup.add(pulseMesh)

      pulseObjects.push({
        mesh: pulseMesh,
        curve,
        offset: Math.random(),
        speed: 0.25 + Math.random() * 0.25,
      })
    }

    // ── Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'light' ? 1.0 : 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, theme === 'light' ? 1.8 : 1.2)
    dirLight.position.set(10, 20, 15)
    scene.add(dirLight)

    // ── Camera & Chapter State Management ──────────────────────
    let activeConfig: ChapterConfig = SceneDirector.getConfig()

    // Current interpolated state values
    const currentState = {
      orbit: activeConfig.orbit,
      elevation: activeConfig.elevation,
      distance: activeConfig.distance,
      panX: activeConfig.panX,
      panY: activeConfig.panY,
      coreX: activeConfig.coreX || 0,
      coreY: activeConfig.coreY || 0,
      coreScale: activeConfig.coreScale,
      lightIntensity: activeConfig.lightIntensity,
      networkActivity: activeConfig.networkActivity,
    }

    const unsubscribe = SceneDirector.subscribe((_chapter, config) => {
      activeConfig = config
    })

    // ── Pointer / Mouse Parallax ────────────────────────────────
    const pointer = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 }

    const onPointerMove = (e: MouseEvent) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1
      pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    // ── Window Resize ───────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Animation Loop with Inertial Damping (Puture-style) ─────
    let animationFrameId: number
    let lastTime = performance.now()
    let isTabVisible = true

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden
      if (isTabVisible) lastTime = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate)
      if (!isTabVisible) return

      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // Exponential damping factor (smooth spring-like interpolation)
      const dampRate = prefersReducedMotion ? 2.0 : 3.8
      const factor = 1.0 - Math.exp(-dampRate * delta)

      // Pointer smoothing
      pointer.currentX += (pointer.targetX - pointer.currentX) * factor * 1.5
      pointer.currentY += (pointer.targetY - pointer.currentY) * factor * 1.5

      // Responsive core positioning (on desktop: placed in right column; on mobile: below text)
      const isMobile = window.innerWidth < 768
      const targetCoreX = isMobile ? 0 : (activeConfig.coreX || 0)
      const targetCoreY = isMobile ? ((activeConfig.coreY || 0) - 2.6) : (activeConfig.coreY || 0)
      const targetCoreScale = isMobile ? activeConfig.coreScale * 0.72 : activeConfig.coreScale

      // Interpolate chapter coordinates
      currentState.orbit += (activeConfig.orbit - currentState.orbit) * factor
      currentState.elevation += (activeConfig.elevation - currentState.elevation) * factor
      currentState.distance += (activeConfig.distance - currentState.distance) * factor
      currentState.panX += (activeConfig.panX - currentState.panX) * factor
      currentState.panY += (activeConfig.panY - currentState.panY) * factor
      currentState.coreX += (targetCoreX - currentState.coreX) * factor
      currentState.coreY += (targetCoreY - currentState.coreY) * factor
      currentState.coreScale += (targetCoreScale - currentState.coreScale) * factor
      currentState.lightIntensity += (activeConfig.lightIntensity - currentState.lightIntensity) * factor
      currentState.networkActivity += (activeConfig.networkActivity - currentState.networkActivity) * factor

      // Position the 3D core in world space (smoothly shifts to the right column on desktop)
      coreGroup.position.set(currentState.coreX, currentState.coreY, 0)

      // Calculate camera coordinates from spherical parameters
      const elevRad = (currentState.elevation + pointer.currentY * 3.5) * (Math.PI / 180)
      const orbitRad = currentState.orbit + pointer.currentX * 0.18

      const cosElev = Math.cos(elevRad)
      const sinElev = Math.sin(elevRad)

      camera.position.x = currentState.panX + currentState.distance * cosElev * Math.sin(orbitRad)
      camera.position.y = currentState.panY + currentState.distance * sinElev
      camera.position.z = currentState.distance * cosElev * Math.cos(orbitRad)

      camera.lookAt(currentState.panX, currentState.panY, 0)

      // Rotate 3D core & rings
      const spinSpeed = prefersReducedMotion ? 0.05 : activeConfig.coreSpin
      coreMesh.rotation.y += delta * spinSpeed * 0.45
      coreMesh.rotation.x += delta * spinSpeed * 0.25

      ring1.rotation.z += delta * spinSpeed * 0.65
      ring2.rotation.z -= delta * spinSpeed * 0.5
      ring3.rotation.y += delta * spinSpeed * 0.4

      // Scale core smoothly
      coreGroup.scale.setScalar(currentState.coreScale)

      // Update light intensity
      corePointLight.intensity = 2.5 * currentState.lightIntensity

      // Rotate ambient particles
      particleSystem.rotation.y += delta * 0.04 * activeConfig.particleSpeed

      // Advance data pulses along curves
      const pulseSpeedMultiplier = 0.8 + currentState.networkActivity * 1.5
      pulseObjects.forEach((item) => {
        item.offset = (item.offset + delta * item.speed * pulseSpeedMultiplier) % 1.0
        const pt = item.curve.getPointAt(item.offset)
        item.mesh.position.copy(pt)
        item.mesh.scale.setScalar(0.7 + currentState.networkActivity * 0.8)
      })

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    // ── Cleanup ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      unsubscribe()

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }

      // Dispose geometries & materials
      coreGeometry.dispose()
      coreWireMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [theme])

  return (
    <div
      ref={mountRef}
      className="persistent-world-canvas-wrapper"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
export default PersistentWorldCanvas
