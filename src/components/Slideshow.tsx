import { useState, useEffect, useRef } from 'react'
import {
  tickerItems,
  IMAGE_COUNT,
  KEN_BURNS_VARIANTS,
  GRADIENT_OVERLAYS,
  subsidiaries,
} from '../data/content'
import { useGeneratedSlogans } from '../hooks/useGeneratedSlogans'

function seededRandom(seed: number): () => number {
  let s = seed + 1
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

interface BokehCircle {
  size: number
  x: number
  y: number
  color: string
  delay: number
  duration: number
}

const BOKEH_COLORS = [
  'rgba(255, 255, 255, 0.06)',
  'rgba(212, 168, 67, 0.08)',
  'rgba(27, 153, 139, 0.07)',
  'rgba(100, 149, 237, 0.06)',
  'rgba(255, 255, 255, 0.04)',
]

function generateBokeh(index: number): BokehCircle[] {
  const rng = seededRandom(index * 137)
  const count = 4 + Math.floor(rng() * 3)
  return Array.from({ length: count }, () => ({
    size: 150 + rng() * 400,
    x: rng() * 100,
    y: rng() * 100,
    color: BOKEH_COLORS[Math.floor(rng() * BOKEH_COLORS.length)],
    delay: rng() * 6,
    duration: 7 + rng() * 10,
  }))
}

export function Slideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef<number>(0)
  const slogans = useGeneratedSlogans()

  // Native JS timing for slide transitions
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 7000)
    return () => window.clearInterval(timerRef.current)
  }, [])

  // Current slogan cycles through ever-growing pool
  const slogan = slogans[currentIndex % slogans.length]
  // Image cycles through 8 generated images
  const imageNum = (currentIndex % IMAGE_COUNT) + 1
  const imageSrc = `${import.meta.env.BASE_URL}images/slide-${imageNum}.webp`
  // Ken Burns variant per slide
  const kbClass = KEN_BURNS_VARIANTS[currentIndex % KEN_BURNS_VARIANTS.length]
  // Gradient overlay for text readability
  const overlay = GRADIENT_OVERLAYS[currentIndex % GRADIENT_OVERLAYS.length]
  // Bokeh
  const bokeh = generateBokeh(currentIndex)
  // Ticker
  const tickerText = tickerItems.join('   \u00b7   ')

  return (
    <div className="slideshow">
      <div key={currentIndex} className="slide">
        {/* Background image with Ken Burns */}
        <div
          className={`slide-image ${kbClass}`}
          style={{ backgroundImage: `url(${imageSrc})` }}
        />

        {/* Gradient overlay */}
        <div className="slide-overlay" style={{ background: overlay }} />

        {/* Bokeh circles */}
        {bokeh.map((b, i) => (
          <div
            key={i}
            className="bokeh"
            style={{
              width: b.size,
              height: b.size,
              left: `${b.x}%`,
              top: `${b.y}%`,
              background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          />
        ))}

        {/* Vignette */}
        <div className="vignette" />

        {/* Grain */}
        <div className="grain" />

        {/* Content */}
        <div className="slide-content">
          <h1 className="slogan">
            {slogan.slogan.split('\n').map((line, i) => (
              <span
                key={i}
                className="slogan-line"
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="subtitle">{slogan.subtitle}</p>
          {(() => {
            const sub = subsidiaries[currentIndex % subsidiaries.length]
            const logoSrc = `${import.meta.env.BASE_URL}images/${sub.logo}`
            return (
              <div className="brand-badge">
                <img src={logoSrc} alt="" className="brand-badge-logo" />
                <span className="brand-badge-text">
                  {sub.name}
                  <span className="brand-badge-tagline">{sub.tagline}</span>
                </span>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Stock ticker */}
      <div className="ticker">
        <div className="ticker-content">
          <span>
            {tickerText}
            {'   \u00b7   '}
            {tickerText}
            {'   \u00b7   '}
            {tickerText}
          </span>
        </div>
      </div>
    </div>
  )
}
