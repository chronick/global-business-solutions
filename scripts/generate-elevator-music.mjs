#!/usr/bin/env node
/**
 * Generate elevator / corporate lobby music via fal.ai Stable Audio.
 *
 * Usage:  node scripts/generate-elevator-music.mjs
 *
 * Requires FAL_AI_API_KEY in .env (or environment).
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load .env manually (no dotenv dependency)
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
  console.error('FAL_AI_API_KEY not found in .env')
  process.exit(1)
}

const PROMPTS = [
  {
    name: 'elevator-lobby',
    prompt:
      'Smooth bossa nova elevator music instrumental, warm electric piano, soft brushed drums, gentle upright bass, relaxing corporate lobby background music, 105 BPM, major key, professional, clean production',
    duration: 47,
  },
  {
    name: 'corporate-hold',
    prompt:
      'Gentle smooth jazz hold music, soft saxophone melody, warm Rhodes piano chords, light percussion, corporate telephone hold music, relaxing, 95 BPM, major key, lo-fi warmth',
    duration: 47,
  },
  {
    name: 'airport-lounge',
    prompt:
      'Ambient lounge music, soft piano arpeggios, light strings, gentle electronic pads, airport terminal background music, calm and sophisticated, 90 BPM, atmospheric, professional',
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
    body: JSON.stringify({
      prompt,
      seconds_total: duration,
      steps: 100,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Submit failed (${res.status}): ${text}`)
  }

  return res.json()
}

async function pollResult(requestId) {
  const url = `https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}/status`
  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    })
    const data = await res.json()

    if (data.status === 'COMPLETED') {
      // Fetch the actual result
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/stable-audio/requests/${requestId}`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      )
      return resultRes.json()
    }

    if (data.status === 'FAILED') {
      throw new Error(`Generation failed: ${JSON.stringify(data)}`)
    }

    process.stdout.write('.')
    await new Promise((r) => setTimeout(r, 3000))
  }
}

async function downloadAudio(url, outPath) {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(outPath, buf)
  console.log(`  Saved: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('Generating elevator music via fal.ai Stable Audio...\n')

  for (const { name, prompt, duration } of PROMPTS) {
    console.log(`[${name}] "${prompt.slice(0, 60)}..."`)
    console.log(`  Duration: ${duration}s`)

    try {
      // Submit
      const submitData = await submitGeneration(prompt, duration)
      const requestId = submitData.request_id
      console.log(`  Queued: ${requestId}`)

      // Poll
      process.stdout.write('  Waiting')
      const result = await pollResult(requestId)
      console.log(' Done!')

      // Download
      const audioUrl = result.audio_file?.url || result.audio?.url
      if (!audioUrl) {
        console.error(`  No audio URL in response:`, JSON.stringify(result))
        continue
      }

      const outPath = resolve(ROOT, 'public', 'audio', `${name}.mp3`)
      await downloadAudio(audioUrl, outPath)
    } catch (err) {
      console.error(`  Error: ${err.message}`)
    }

    console.log()
  }

  console.log('Done! Audio files saved to public/audio/')
}

main()
