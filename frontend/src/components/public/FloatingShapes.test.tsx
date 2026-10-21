import { render, fireEvent, cleanup } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { FloatingShapes } from './FloatingShapes'

describe('FloatingShapes parallax', () => {
  let frames: Map<number, FrameRequestCallback>
  let reducedMotion: MediaQueryList
  let motionChange: () => void
  let nextFrame: number

  beforeEach(() => {
    frames = new Map()
    nextFrame = 0
    reducedMotion = { matches: false, addEventListener: vi.fn((_event, listener) => { motionChange = listener }), removeEventListener: vi.fn() } as unknown as MediaQueryList
    vi.stubGlobal('matchMedia', vi.fn((query: string) => query.includes('reduced-motion') ? reducedMotion : {
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback)
      return nextFrame
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('preserves flips and rotations, settles, and starts only one loop on movement', () => {
    const { container, rerender } = render(<FloatingShapes theme="dark" />)
    const flipped = container.querySelector<SVGElement>('[style*="scaleX"]')!
    const rotated = container.querySelector<SVGElement>('[style*="rotate"]')!
    expect(frames.size).toBe(0)

    const move = () => fireEvent.mouseMove(window, { clientX: window.innerWidth, clientY: window.innerHeight })
    move()
    move()
    expect(frames.size).toBe(1)
    let count = 0
    while (frames.size && count++ < 500) {
      const [id, callback] = frames.entries().next().value!
      frames.delete(id)
      callback(count * 16)
    }
    expect(frames.size).toBe(0)
    expect(flipped.style.transform).toMatch(/^scaleX\(-1\) translate\(/)
    expect(rotated.style.transform).toMatch(/^rotate\(180deg\) translate\(/)

    // Theme changes replace SVG helpers; the cache must follow the new nodes.
    rerender(<FloatingShapes theme="light" />)
    fireEvent.mouseMove(window, { clientX: 0, clientY: 0 })
    const [id, callback] = frames.entries().next().value!
    frames.delete(id)
    callback(16)
    expect(container.querySelector<SVGElement>('[style*="scaleX"]')!.style.transform).toContain('translate(')

    Object.defineProperty(reducedMotion, 'matches', { value: true })
    motionChange()
    expect(frames.size).toBe(0)
    expect(container.querySelector<SVGElement>('[style*="scaleX"]')!.style.transform).toBe('scaleX(-1)')
    move()
    expect(frames.size).toBe(0)
  })

  it('does not animate when reduced motion is already enabled', () => {
    Object.defineProperty(reducedMotion, 'matches', { value: true })
    render(<FloatingShapes theme="dark" />)
    fireEvent.mouseMove(window, { clientX: 0, clientY: 0 })
    expect(frames.size).toBe(0)
  })
})
