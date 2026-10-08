import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Cpu, Activity, Radio } from 'lucide-react'
import './Hero3DHub.css'

export const Hero3DHub: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 7.5)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Group for all 3D core elements
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    // 1. Central Core Sphere / Crystal
    const coreGeo = new THREE.IcosahedronGeometry(1.3, 2)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    coreGroup.add(coreMesh)

    // Inner Solid Glow Sphere
    const innerGeo = new THREE.SphereGeometry(0.85, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff3344,
      transparent: true,
      opacity: 0.85,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerMesh)

    // 2. Orbital Tech Rings
    const createRing = (radius: number, tube: number, colorHex: number, rotX: number, rotY: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100)
      const ringMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      ringMesh.rotation.x = rotX
      ringMesh.rotation.y = rotY
      return ringMesh
    }

    const ring1 = createRing(2.1, 0.025, 0xef4444, Math.PI / 3, Math.PI / 6)
    const ring2 = createRing(2.6, 0.02, 0xff6b6b, Math.PI / 2.2, -Math.PI / 4)
    const ring3 = createRing(3.1, 0.015, 0x991b1b, Math.PI / 6, Math.PI / 3)

    coreGroup.add(ring1)
    coreGroup.add(ring2)
    coreGroup.add(ring3)

    // 3. Orbital Sensor Nodes (Small spheres on rings)
    const nodeGeo = new THREE.SphereGeometry(0.09, 16, 16)
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    
    const node1 = new THREE.Mesh(nodeGeo, nodeMat)
    const node2 = new THREE.Mesh(nodeGeo, nodeMat)
    const node3 = new THREE.Mesh(nodeGeo, nodeMat)

    ring1.add(node1)
    ring2.add(node2)
    ring3.add(node3)

    node1.position.set(2.1, 0, 0)
    node2.position.set(0, 2.6, 0)
    node3.position.set(-3.1, 0, 0)

    // 4. Background Particle Field
    const particlesCount = 350
    const particlePositions = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 16
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 16
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2
    }

    const particlesGeo = new THREE.BufferGeometry()
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

    const particlesMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particleSystem = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particleSystem)

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLightRed = new THREE.PointLight(0xef4444, 4, 15)
    pointLightRed.position.set(2, 3, 4)
    scene.add(pointLightRed)

    const pointLightWhite = new THREE.PointLight(0xffffff, 2, 15)
    pointLightWhite.position.set(-3, -2, 3)
    scene.add(pointLightWhite)

    // Mouse Interaction
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }

    window.addEventListener('mousemove', onMouseMove)

    // Resize Handler
    const onResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    window.addEventListener('resize', onResize)

    // Animation Loop
    let clock = new THREE.Clock()
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Core rotation
      coreMesh.rotation.y = elapsedTime * 0.25
      coreMesh.rotation.x = elapsedTime * 0.15
      innerMesh.rotation.y = -elapsedTime * 0.4

      // Pulse inner mesh scale
      const scalePulse = 1 + Math.sin(elapsedTime * 2.5) * 0.06
      innerMesh.scale.set(scalePulse, scalePulse, scalePulse)

      // Ring rotations
      ring1.rotation.z = elapsedTime * 0.35
      ring2.rotation.z = -elapsedTime * 0.25
      ring3.rotation.x = elapsedTime * 0.2

      // Particles float
      particleSystem.rotation.y = elapsedTime * 0.03

      // Smooth mouse parallax
      targetX += (mouseX * 0.5 - targetX) * 0.05
      targetY += (mouseY * 0.5 - targetY) * 0.05

      coreGroup.rotation.y = targetX
      coreGroup.rotation.x = -targetY

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="hero-3d-container">
      <div ref={containerRef} className="hero-3d-canvas" />

      {/* Floating 3D Telemetry HUD Cards */}
      <div className="hud-card hud-top-left">
        <div className="hud-icon"><Cpu size={16} /></div>
        <div className="hud-text">
          <span className="hud-title">SVIET Telemetry Core</span>
          <span className="hud-status status-active">● Active Node</span>
        </div>
      </div>

      <div className="hud-card hud-bottom-right">
        <div className="hud-icon"><Activity size={16} /></div>
        <div className="hud-text">
          <span className="hud-title">Lab SLA Monitor</span>
          <span className="hud-val">99.4% Automated Response</span>
        </div>
      </div>

      <div className="hud-card hud-top-right">
        <div className="hud-icon"><Radio size={16} /></div>
        <div className="hud-text">
          <span className="hud-title">Thinkspace Lab</span>
          <span className="hud-status">Live Sensor Sync</span>
        </div>
      </div>
    </div>
  )
}

export default Hero3DHub

