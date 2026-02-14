#!/usr/bin/env node
/**
 * Generate corporate stock photo slide images via fal.ai Flux (sync endpoint).
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
  'Professional corporate office building at sunset, glass skyscraper reflecting golden light, modern architecture, stock photo style, sharp focus, warm cinematic lighting, 16:9 wide shot',
  'Diverse business team shaking hands in modern conference room, glass walls, city skyline view, professional corporate photography, bright natural lighting, stock photo',
  'Global supply chain logistics, massive container port at dawn, cargo ships and cranes, aerial view, cinematic dramatic lighting, professional photography, wide angle',
  'Modern data center server room with blue LED lighting, rows of servers stretching into distance, technology infrastructure, clean professional photography',
  'Abstract business growth concept, upward arrows and charts overlaid on city skyline at night, double exposure style, blue and gold tones, corporate success imagery',
  'Executive boardroom with long polished table, floor to ceiling windows overlooking city at dusk, empty leather chairs, power and prestige, architectural photography',
  'Warehouse automation, robotic arms in modern fulfillment center, bright efficient LED lighting, supply chain technology, professional industrial photography, wide shot',
  'Wind turbines and solar panels in green field at golden hour sunrise, sustainable energy, corporate ESG imagery, clean bright professional photography, wide landscape',
]

async function generateImage(prompt) {
  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1920, height: 1080 },
      num_images: 1,
    }),
  })
  if (!res.ok) throw new Error(`Generation failed (${res.status}): ${await res.text()}`)
  return res.json()
}

async function downloadImage(url, outPath) {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(outPath, buf)
  console.log(`  Saved: ${outPath} (${(buf.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('Generating corporate slide images via fal.ai Flux Schnell...\n')

  for (let i = 0; i < PROMPTS.length; i++) {
    const slideNum = i + 9
    const prompt = PROMPTS[i]
    console.log(`[slide-${slideNum}] "${prompt.slice(0, 60)}..."`)

    try {
      const result = await generateImage(prompt)
      const imageUrl = result.images?.[0]?.url
      if (!imageUrl) {
        console.error('  No image URL:', JSON.stringify(result).slice(0, 200))
        continue
      }
      const outPath = resolve(ROOT, 'public', 'images', `slide-${slideNum}.webp`)
      await downloadImage(imageUrl, outPath)
    } catch (err) {
      console.error(`  Error: ${err.message}`)
    }
    console.log()
  }

  console.log('Done!')
}

main()
