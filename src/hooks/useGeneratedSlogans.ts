import { staticSlogans } from '../data/content'
import { generateProceduralSlogan } from '../data/sloganGenerator'

/** Pre-generate procedural slogans at module load time */
const PROCEDURAL_COUNT = 500
const proceduralSlogans = Array.from(
  { length: PROCEDURAL_COUNT },
  (_, i) => generateProceduralSlogan(i),
)

/** Fisher-Yates shuffle so every page load gets a different order */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const allSlogans = shuffle([...staticSlogans, ...proceduralSlogans])

export function useGeneratedSlogans() {
  return allSlogans
}
