#!/usr/bin/env node
/**
 * Generate additional corporate slide images (slides 17-28) via fal.ai Flux.
 * Enhanced AI/corporate aesthetic prompts.
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
  'Futuristic AI neural network visualization, glowing blue nodes and connections on dark background, corporate tech keynote style, abstract data visualization, cinematic',
  'Corporate executive giving keynote presentation on massive stage, giant screens behind, TED-talk style lighting, packed audience silhouettes, professional event photography',
  'Aerial view of a smart city at night, interconnected glowing data lines between buildings, IoT visualization, blue and teal neon accents, futuristic corporate',
  'Abstract flowing data streams, particles forming upward arrows, dark background with blue gold gradients, business growth concept, motion blur, corporate art',
  'Modern open-plan corporate office, standing desks, plants, exposed brick, diverse team collaborating, natural light flooding in, lifestyle corporate photography',
  'Global world map made of glowing interconnected dots and lines on dark background, network visualization, data connections spanning continents, corporate infographic style',
  'Robotic hand and human hand almost touching, Michelangelo creation style, blue holographic glow, AI meets humanity concept, corporate AI marketing imagery',
  'Massive corporate campus aerial shot, futuristic glass buildings surrounded by manicured grounds, drone photography style, golden hour, Silicon Valley corporate aesthetic',
  'Abstract blockchain visualization, floating translucent cubes connected by light beams, dark gradient background, enterprise technology marketing, blue purple tones',
  'Professional woman presenting holographic data dashboard, augmented reality interface floating in air, dark room with blue glow, futuristic corporate technology',
  'Container ships in massive port at golden hour with overlay of digital data analytics, supply chain meets technology, double exposure corporate style',
  'Sleek corporate lobby with digital art walls, marble floors, people in business attire walking, architectural photography, warm LED accent lighting',
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
  console.log('Generating additional corporate slide images (17-28) via fal.ai Flux Schnell...\n')

  for (let i = 0; i < PROMPTS.length; i++) {
    const slideNum = i + 17
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
