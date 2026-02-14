import { staticSlogans } from '../data/content'
import { generateProceduralSlogan } from '../data/sloganGenerator'

/** Pre-generate procedural slogans at module load time */
const PROCEDURAL_COUNT = 500
const proceduralSlogans = Array.from(
  { length: PROCEDURAL_COUNT },
  (_, i) => generateProceduralSlogan(i),
)

/** Static hand-crafted slogans first, then procedural fill */
const allSlogans = [...staticSlogans, ...proceduralSlogans]

export function useGeneratedSlogans() {
  return allSlogans
}
