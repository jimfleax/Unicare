/**
 * SceneDirector.ts
 * Chapter-driven 3D Scene Orchestration for Unicare.
 * Inspired by Puture's chapter choreography architecture (assets/SpaceScene).
 */

export interface ChapterConfig {
  orbit: number       // Azimuthal rotation angle (radians or degrees)
  elevation: number   // Altitude angle above the horizontal plane (degrees)
  distance: number    // Camera zoom distance
  panY: number        // Vertical view framing offset
  panX: number        // Horizontal framing offset
  coreX: number       // 3D position X of the central facility core
  coreY: number       // 3D position Y of the central facility core
  coreScale: number   // Scale factor of the digital facility core
  coreSpin: number    // Rotational speed of internal rings
  particleSpeed: number // Ambient particle stream velocity
  lightIntensity: number // Core glow & bloom intensity
  networkActivity: number // Intensity of 3D data routing arcs (0 to 1)
  ringTilt: number    // Axial tilt of the orbital tech rings (degrees)
  themeColor: string  // Primary energy color hex
}

export const CHAPTERS: Record<string, ChapterConfig> = {
  hero: {
    orbit: 0.25,
    elevation: 20,
    distance: 17,
    panY: 0,
    panX: 0,
    coreX: 5.6, // Placed precisely in the right 50% column, clear of left text
    coreY: 0,
    coreScale: 1.2,
    coreSpin: 0.45,
    particleSpeed: 0.45,
    lightIntensity: 1.3,
    networkActivity: 0.3,
    ringTilt: 25,
    themeColor: '#ef4444',
  },
  features: {
    orbit: 0.9,
    elevation: 28,
    distance: 20,
    panY: -0.5,
    panX: 0,
    coreX: 3.2,
    coreY: 0,
    coreScale: 0.88,
    coreSpin: 0.35,
    particleSpeed: 0.5,
    lightIntensity: 0.95,
    networkActivity: 0.4,
    ringTilt: 40,
    themeColor: '#f97316',
  },
  workflow: {
    orbit: 1.7,
    elevation: 16,
    distance: 13.5,
    panY: -1.0,
    panX: 0,
    coreX: 0,
    coreY: -0.6,
    coreScale: 1.15,
    coreSpin: 0.7,
    particleSpeed: 0.8,
    lightIntensity: 1.4,
    networkActivity: 0.65,
    ringTilt: 55,
    themeColor: '#ef4444',
  },
  routing: {
    orbit: 3.14,
    elevation: 32,
    distance: 15.5,
    panY: 0.2,
    panX: 0,
    coreX: 0,
    coreY: 0,
    coreScale: 1.2,
    coreSpin: 1.1,
    particleSpeed: 1.4,
    lightIntensity: 1.5,
    networkActivity: 1.0, // Peak routing activity with pulsing data arcs
    ringTilt: 70,
    themeColor: '#dc2626',
  },
  pipeline: {
    orbit: 4.2,
    elevation: 24,
    distance: 14,
    panY: -1.2,
    panX: 0,
    coreX: 0,
    coreY: -0.8,
    coreScale: 1.05,
    coreSpin: 0.85,
    particleSpeed: 1.1,
    lightIntensity: 1.3,
    networkActivity: 0.85,
    ringTilt: 48,
    themeColor: '#f87171',
  },
  maintenance: {
    orbit: 5.4,
    elevation: 38,
    distance: 19,
    panY: 0.6,
    panX: 0,
    coreX: 0,
    coreY: 0.4,
    coreScale: 1.25,
    coreSpin: 0.4,
    particleSpeed: 0.6,
    lightIntensity: 1.1,
    networkActivity: 0.5,
    ringTilt: 30,
    themeColor: '#ef4444',
  },
}

type ChapterListener = (chapter: string, config: ChapterConfig) => void

class SceneDirectorEngine {
  private currentChapter: string = 'hero'
  private listeners: Set<ChapterListener> = new Set()

  public getChapter(): string {
    return this.currentChapter
  }

  public getConfig(chapterName?: string): ChapterConfig {
    const key = chapterName || this.currentChapter
    return CHAPTERS[key] || CHAPTERS.hero
  }

  public setChapter(chapter: string) {
    if (!CHAPTERS[chapter] || chapter === this.currentChapter) return
    this.currentChapter = chapter
    const config = CHAPTERS[chapter]
    this.listeners.forEach((listener) => listener(chapter, config))
  }

  public subscribe(listener: ChapterListener): () => void {
    this.listeners.add(listener)
    listener(this.currentChapter, this.getConfig())
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export const SceneDirector = new SceneDirectorEngine()
