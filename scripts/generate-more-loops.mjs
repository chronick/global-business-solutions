#!/usr/bin/env node
/**
 * Generate additional elevator / corporate music loops via fal.ai Stable Audio.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load .env
const envPath = resolve(ROOT, '.env')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const match = line.match(/^([A-Z_]+)=(.+)$/)
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].trim()
  }
}

const FAL_KEY = process.env.FAL_AI_API_KEY
if (!FAL_KEY) {
  console.error('FAL_AI_API_KEY not found')
  process.exit(1)
}

const PROMPTS = [
  {
    name: 'supply-chain-groove',
    prompt:
      'Upbeat smooth jazz funk instrumental, slap bass, clean guitar, Rhodes keyboard, optimistic corporate training video music, 112 BPM, major key, warm and professional production',
    duration: 47,
  },
  {
    name: 'shareholder-vibes',
    prompt:
      'Inspirational corporate presentation music, soaring strings, gentle piano melody, light electronic percussion, triumphant and motivational, 100 BPM, major key, cinematic corporate',
    duration: 47,
  },
  {
    name: 'quarterly-gains',
    prompt:
      'Uplifting easy listening instrumental, acoustic guitar picking, soft flute melody, light bongos, positive corporate results video background music, 108 BPM, feel-good major key',
    duration: 47,
  },
  {
    name: 'synergy-summit',
    prompt:
      'Chill downtempo lounge beats, warm pad synths, muted trumpet solo, brushed snare, sophisticated hotel lobby cocktail hour music, 88 BPM, relaxing and classy',
    duration: 47,
  },
  {
    name: 'global-expansion',
    prompt:
      'World music fusion instrumental, steel drums, gentle tabla percussion, smooth saxophone, upbeat global corporate celebration music, 115 BPM, bright and optimistic',
    duration: 47,
  },
]

async function submitGeneration(prompt, duration) {
  const res = await fetch('https://queue.fal.run/fal-ai/stable-audio', {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, seconds_total: duration, steps: 100 }),
  })
  if (!res.ok) throw new Error(`Submit failed (${res.status}): ${await res.text()}`)
  return res.json()
}

async function pollResult(requestId) {
  const url = `https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}/status`
  while (true) {
    const res = await fetch(url, { headers: { Authorization: `Key ${FAL_KEY}` } })
    const data = await res.json()
    if (data.status === 'COMPLETED') {
      const r = await fetch(
        `https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      )
      return r.json()
    }
    if (data.status === 'FAILED') throw new Error(`Failed: ${JSON.stringify(data)}`)
    process.stdout.write('.')
    await new Promise((r) => setTimeout(r, 3000))
  }
}

async function main() {
  console.log('Generating more elevator music loops...\n')
  for (const { name, prompt, duration } of PROMPTS) {
    console.log(`[${name}] "${prompt.slice(0, 60)}..."`)
    try {
      const { request_id } = await submitGeneration(prompt, duration)
      console.log(`  Queued: ${request_id}`)
      process.stdout.write('  Waiting')
      const result = await pollResult(request_id)
      console.log(' Done!')
      const audioUrl = result.audio_file?.url || result.audio?.url
      if (!audioUrl) { console.error('  No audio URL:', JSON.stringify(result)); continue }
      const res = await fetch(audioUrl)
      const buf = Buffer.from(await res.arrayBuffer())
      const outPath = resolve(ROOT, 'public', 'audio', `${name}.mp3`)
      writeFileSync(outPath, buf)
      console.log(`  Saved: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)\n`)
    } catch (err) {
      console.error(`  Error: ${err.message}\n`)
    }
  }
  console.log('Done!')
}

main()
