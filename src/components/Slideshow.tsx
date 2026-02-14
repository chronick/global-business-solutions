import { useState, useEffect, useRef } from 'react'
import {
  tickerItems as rawTickerItems,
  IMAGE_COUNT,
  KEN_BURNS_VARIANTS as rawKB,
  GRADIENT_OVERLAYS as rawGradients,
  subsidiaries as rawSubs,
  SLIDE_LAYOUTS as rawLayouts,
  TEXT_ENTRANCES as rawEntrances,
  CORPORATE_STATS as rawStats,
} from '../data/content'

/** Fisher-Yates shuffle (non-mutating) */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Shuffle everything at module load so each reload feels fresh
const shuffledImageIndices = shuffle(Array.from({ length: IMAGE_COUNT }, (_, i) => i + 1))
const shuffledKB = shuffle(rawKB)
const shuffledGradients = shuffle(rawGradients)
const shuffledLayouts = shuffle(rawLayouts)
const shuffledEntrances = shuffle(rawEntrances)
const shuffledStats = shuffle(rawStats)
const tickerItems = shuffle(rawTickerItems)
// Keep BrightPath (index 0) as umbrella; shuffle the rest for featured subsidiary
const umbrellaSub = rawSubs[0]
const shuffledFeaturedSubs = shuffle(rawSubs.slice(1))
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

// Panel transition types cycle: none, wipe, split, diagonal
const PANEL_TYPES = ['none', 'wipe', 'split', 'diagonal'] as const

// Parallax element shapes
const PARALLAX_SHAPES = ['square', 'circle', 'line', 'plus'] as const

interface NetworkNode { x: number; y: number; r: number }

function generateNetworkNodes(index: number): NetworkNode[] {
  const rng = seededRandom(index * 271)
  const count = 8 + Math.floor(rng() * 5)
  return Array.from({ length: count }, () => ({
    x: rng() * 100,
    y: rng() * 100,
    r: 2 + rng() * 3,
  }))
}

interface ParallaxItem {
  shape: typeof PARALLAX_SHAPES[number]
  x: number; y: number
  size: number
  opacity: number
  driftX: number; driftY: number; driftR: number
  duration: number
}

function generateParallax(index: number): ParallaxItem[] {
  const rng = seededRandom(index * 313)
  const count = 3 + Math.floor(rng() * 3)
  return Array.from({ length: count }, () => ({
    shape: PARALLAX_SHAPES[Math.floor(rng() * PARALLAX_SHAPES.length)],
    x: rng() * 90 + 5,
    y: rng() * 80 + 10,
    size: 20 + rng() * 40,
    opacity: 0.04 + rng() * 0.04,
    driftX: -30 + rng() * 60,
    driftY: -30 + rng() * 60,
    driftR: -20 + rng() * 40,
    duration: 8 + rng() * 12,
  }))
}

// Stat counter component with animated count-up
function StatCounter({ value, label }: { value: string; label: string }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Extract numeric portion for count-up
    const numMatch = value.match(/[\d,]+\.?\d*/)
    if (!numMatch || value === '∞') {
      // Non-numeric or infinity: just show after a short delay
      const t = setTimeout(() => setDisplay(value), 300)
      return () => clearTimeout(t)
    }

    const targetStr = numMatch[0]
    const target = parseFloat(targetStr.replace(/,/g, ''))
    const prefix = value.slice(0, value.indexOf(targetStr))
    const suffix = value.slice(value.indexOf(targetStr) + targetStr.length)
    const hasCommas = targetStr.includes(',')
    const decimals = targetStr.includes('.') ? targetStr.split('.')[1].length : 0

    const duration = 2000
    const startTime = performance.now()
    let frame: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      let formatted = decimals > 0
        ? current.toFixed(decimals)
        : Math.round(current).toString()

      if (hasCommas) {
        const parts = formatted.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        formatted = parts.join('.')
      }

      setDisplay(`${prefix}${formatted}${suffix}`)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="stat-counter" ref={ref}>
      <div className="stat-counter-value">{display}</div>
      <div className="stat-counter-label">{label}</div>
    </div>
  )
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
  // Image cycles through shuffled image indices
  const imageNum = shuffledImageIndices[currentIndex % shuffledImageIndices.length]
  const imageSrc = `${import.meta.env.BASE_URL}images/slide-${imageNum}.webp`
  // Ken Burns variant per slide
  const kbClass = shuffledKB[currentIndex % shuffledKB.length]
  // Gradient overlay for text readability
  const overlay = shuffledGradients[currentIndex % shuffledGradients.length]
  // Bokeh
  const bokeh = generateBokeh(currentIndex)
  // Ticker
  const tickerText = tickerItems.join('   \u00b7   ')

  // Layout cycling
  const layout = shuffledLayouts[currentIndex % shuffledLayouts.length]
  const layoutClass = layout === 'centered' ? '' : `layout-${layout}`

  // Entrance animation cycling
  const entrance = shuffledEntrances[currentIndex % shuffledEntrances.length]
  const entranceClass = entrance === 'fade-blur-up' ? '' : `entrance-${entrance}`

  // Panel transition: cycle through types
  const panelType = PANEL_TYPES[currentIndex % PANEL_TYPES.length]

  // Letterboxing: every 5th slide
  const isLetterboxed = currentIndex % 5 === 0 && currentIndex > 0

  // Light streaks: every other slide
  const showLightStreaks = currentIndex % 2 === 1
  const lightStreakRng = seededRandom(currentIndex * 197)

  // Network overlay: every 3rd slide
  const showNetwork = currentIndex % 3 === 0
  const networkNodes = showNetwork ? generateNetworkNodes(currentIndex) : []

  // Stat counter: every 8th slide
  const isStatSlide = currentIndex % 8 === 0 && currentIndex > 0
  const stat = shuffledStats[Math.floor(currentIndex / 8) % shuffledStats.length]

  // Parallax depth elements
  const parallaxItems = generateParallax(currentIndex)

  // Presentation layout alternates photo side
  const photoLeftClass = layout === 'presentation' && currentIndex % 2 === 1 ? 'photo-left' : ''

  // Featured subsidiary: rotates through shuffled non-BrightPath subs
  const featuredSub = shuffledFeaturedSubs[currentIndex % shuffledFeaturedSubs.length]
  const featuredLogoSrc = `${import.meta.env.BASE_URL}images/${featuredSub.logo}`

  // Umbrella badge: always BrightPath
  const umbrellaLogoSrc = `${import.meta.env.BASE_URL}images/${umbrellaSub.logo}`

  // Build slide class name
  const slideClasses = [
    'slide',
    layoutClass,
    entranceClass,
    photoLeftClass,
    isLetterboxed ? 'letterbox' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="slideshow">
      <div key={currentIndex} className={slideClasses}>
        {/* Panel transition */}
        {panelType === 'wipe' && (
          <div className="panel-transition panel-wipe" />
        )}
        {panelType === 'split' && (
          <div className="panel-transition">
            <div className="panel-split-left" />
            <div className="panel-split-right" />
          </div>
        )}
        {panelType === 'diagonal' && (
          <div className="panel-transition panel-diagonal" />
        )}

        {/* Background image with Ken Burns */}
        <div
          className={`slide-image ${kbClass}`}
          style={{ backgroundImage: `url(${imageSrc})` }}
        />

        {/* Gradient overlay */}
        <div className="slide-overlay" style={{ background: overlay }} />

        {/* Geometric network overlay */}
        {showNetwork && networkNodes.length > 0 && (
          <svg className="network-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            {networkNodes.map((a, i) =>
              networkNodes.slice(i + 1).map((b, j) => {
                const dist = Math.hypot(a.x - b.x, a.y - b.y)
                return dist < 30 ? (
                  <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                ) : null
              })
            )}
            {networkNodes.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={n.r} />
            ))}
          </svg>
        )}

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

        {/* Light streaks */}
        {showLightStreaks && (
          <>
            <div
              className="light-streak"
              style={{
                top: `${20 + lightStreakRng() * 30}%`,
                transform: `rotate(${25 + lightStreakRng() * 10}deg)`,
                animationDelay: `${lightStreakRng() * 1}s`,
              }}
            />
            <div
              className="light-streak"
              style={{
                top: `${50 + lightStreakRng() * 30}%`,
                transform: `rotate(${28 + lightStreakRng() * 7}deg)`,
                animationDelay: `${0.5 + lightStreakRng() * 1.5}s`,
                opacity: 0.06,
              }}
            />
          </>
        )}

        {/* Parallax depth elements */}
        {parallaxItems.map((p, i) => (
          <div
            key={i}
            className={`parallax-element parallax-${p.shape}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
              '--drift-r': `${p.driftR}deg`,
              animationDuration: `${p.duration}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Vignette */}
        <div className="vignette" />

        {/* Grain */}
        <div className="grain" />

        {/* Content */}
        <div className="slide-content">
          {isStatSlide ? (
            <StatCounter value={stat.value} label={stat.label} />
          ) : (
            <>
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
              {/* Featured subsidiary */}
              <div className="featured-subsidiary">
                <img src={featuredLogoSrc} alt="" className="featured-subsidiary-logo" />
                <div className="featured-subsidiary-info">
                  <span className="featured-subsidiary-name">{featuredSub.name}</span>
                  <span className="featured-subsidiary-tagline">{featuredSub.tagline}</span>
                </div>
              </div>
            </>
          )}
          {/* Umbrella badge — always BrightPath */}
          <div className="umbrella-badge">
            <img src={umbrellaLogoSrc} alt="" className="umbrella-badge-logo" />
            <span className="umbrella-badge-text">{umbrellaSub.name}</span>
          </div>
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
