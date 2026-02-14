import { useState, useEffect, useCallback, useRef } from 'react'
import { staticSlogans, type SloganData } from '../data/content'

const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY as string

const SYSTEM_PROMPT = `You are a corporate buzzword slogan generator for "BrightPath Global Solutions Group (BPGS)" — an umbrella mega-corp with 15 subsidiaries: BrightPath SynergyWorks, CivicBloom Infrastructure, CommunityFirst Services, ClearConscience Compliance, TrustWard Risk & Assurance, SafeHarbor Monitoring, OmniSolve Technology Partners, CloudKind Data Cooperative, PeopleForward Initiatives, FairDeal Procurement Solutions, Prosperitage Advisory, EverTrust Settlements Bureau, WarmSmile Utilities, SincereCare Life Sciences, and Neighborhood Harmony Security. You generate absurdly generic, cringe-worthy corporate slogans that sound like they belong on a motivational poster in a beige cubicle farm or in a mandatory corporate training video from 2003. Think extreme synergy, paradigm shifts, thought leadership, and meaningless business jargon. Subtitles should sometimes reference specific subsidiaries with "A BrightPath Company" as their tagline.`

const USER_PROMPT = `Generate exactly 5 unique corporate buzzword slogans. Each slogan should be 2-4 SHORT lines (these display as large headlines on a slideshow).

Return ONLY a valid JSON array, no markdown fences, no explanation:
[{"slogan":"Line One\\nLine Two\\nLine Three","subtitle":"A Short Tagline"},...]

Use \\n for line breaks within slogans. Make them ridiculously corporate. Mix terms like: synergy, paradigm, leverage, disrupt, pivot, bandwidth, deep dive, circle back, thought leadership, move the needle, low-hanging fruit, best practices, core competencies, holistic, scalable, actionable insights, stakeholder alignment, value proposition, bleeding edge, ecosystem, north star, OKRs, KPIs, ROI, boil the ocean, take this offline, put a pin in it, unpack, double-click, net-net, at the end of the day, going forward, open the kimono, peel the onion, run it up the flagpole, drink the Kool-Aid, eat our own dog food.

Be creative. Be absurd. Be corporate.`

export function useGeneratedSlogans() {
  const [pool, setPool] = useState<SloganData[]>([...staticSlogans])
  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchBatch = useCallback(async () => {
    if (!OPENROUTER_KEY || fetchingRef.current) return
    fetchingRef.current = true

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'BrightPath Global Solutions Group',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          temperature: 1.2,
          max_tokens: 800,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: USER_PROMPT },
          ],
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const content: string = data.choices?.[0]?.message?.content || ''

      // Extract JSON array from response (handles markdown fences too)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch && mountedRef.current) {
        const generated = JSON.parse(jsonMatch[0]) as SloganData[]
        const valid = generated.filter(
          (s) => s.slogan && s.subtitle && typeof s.slogan === 'string',
        )
        if (valid.length > 0) {
          setPool((prev) => [...prev, ...valid])
        }
      }
    } catch (e) {
      console.warn('[BPGS] Slogan generation failed:', e)
    }

    fetchingRef.current = false
  }, [])

  useEffect(() => {
    mountedRef.current = true
    // Initial fetch after short delay (let UI settle first)
    const initial = setTimeout(fetchBatch, 3000)
    // Then continuously generate more every 60s
    const interval = setInterval(fetchBatch, 60_000)
    return () => {
      mountedRef.current = false
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [fetchBatch])

  return pool
}
