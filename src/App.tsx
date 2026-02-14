import { useState, useEffect, useCallback } from 'react'
import { Slideshow } from './components/Slideshow'
import { useElevatorMusic } from './hooks/useElevatorMusic'

function App() {
  const [muted, setMuted] = useState(false)
  const { start, stop } = useElevatorMusic()
  const [started, setStarted] = useState(false)

  // Auto-start music on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!started) {
        start()
        setStarted(true)
      }
    }
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('keydown', handleInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
    }
  }, [start, started])

  const handleMute = useCallback(() => {
    if (muted) {
      start()
    } else {
      stop()
    }
    setMuted((m) => !m)
  }, [muted, start, stop])

  return (
    <>
      <Slideshow />
      <button className="mute-button" onClick={handleMute}>
        {muted ? '\ud83d\udd07 UNMUTE' : '\ud83d\udd0a MUTE'}
      </button>
    </>
  )
}

export default App
