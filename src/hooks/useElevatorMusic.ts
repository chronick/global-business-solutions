import { useRef, useCallback } from 'react'

const TRACKS = [
  'elevator-lobby',
  'corporate-hold',
  'airport-lounge',
  'supply-chain-groove',
  'shareholder-vibes',
  'quarterly-gains',
  'synergy-summit',
  'global-expansion',
]

export function useElevatorMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playingRef = useRef(false)
  const trackIndexRef = useRef(0)

  const playNext = useCallback(() => {
    if (!playingRef.current) return

    const track = TRACKS[trackIndexRef.current % TRACKS.length]
    const base = import.meta.env.BASE_URL ?? '/'
    const audio = new Audio(`${base}audio/${track}.mp3`)
    audio.volume = 0.35
    audioRef.current = audio

    audio.addEventListener('ended', () => {
      trackIndexRef.current += 1
      playNext()
    })

    audio.play().catch(() => {
      // Autoplay blocked — silently fail
    })
  }, [])

  const start = useCallback(() => {
    if (playingRef.current) return
    playingRef.current = true
    trackIndexRef.current = Math.floor(Math.random() * TRACKS.length)
    playNext()
  }, [playNext])

  const stop = useCallback(() => {
    playingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

  return { start, stop, isPlaying: playingRef }
}
