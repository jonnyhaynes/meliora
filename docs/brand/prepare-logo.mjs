/**
 * Prepares the Meliora logo for use on the site.
 *
 * The artwork supplied from the old Wix site is a PNG on a flat white background
 * with no alpha channel, which cannot sit over the photography the design is
 * built around. This keys the white out and produces the three derivatives the
 * site needs.
 *
 * Run from the repository root:
 *
 *   node docs/brand/prepare-logo.mjs docs/brand/logo-original-white-background.png
 *
 * Requires sharp, which is already a project dependency.
 */

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const input = process.argv[2] || 'docs/brand/logo-original-white-background.png'
const outDir = 'src/seed/assets'
const ALPHA_MIN = 24

/**
 * Removes a flat white background.
 *
 * Alpha comes from luminance, ramped across a narrow band near white, and the
 * original colour is kept. Ramping matters: deriving alpha from the lowest
 * channel would leave the gold rules semi-transparent because they are
 * mid-tone rather than dark, and a hard threshold would produce jagged edges.
 */
const WHITE_BAND = 0.25

async function removeWhite(source, destination) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { channels, height, width } = info
  const out = Buffer.alloc(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      const o = (y * width + x) * 4

      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const alpha = Math.max(0, Math.min(1, (1 - luminance / 255) / WHITE_BAND))

      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
      out[o + 3] = Math.round(alpha * 255)
    }
  }

  await sharp(out, { raw: { channels: 4, height, width } }).png().toFile(destination)
}

const load = async (file) => {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { ...info, data }
}

/** Contiguous bands of rows that contain ink — one per line of the lockup. */
function rowBands({ data, height, width }) {
  const bands = []
  let start = null

  for (let y = 0; y < height; y++) {
    let ink = 0
    for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > ALPHA_MIN) ink++
    if (ink > 0 && start === null) start = y
    if (ink === 0 && start !== null) {
      bands.push([start, y - 1])
      start = null
    }
  }
  if (start !== null) bands.push([start, height - 1])
  return bands
}

/** Contiguous runs of columns containing ink, within a row range. */
function columnRuns({ data, width }, top, bottom) {
  const runs = []
  let start = null

  for (let x = 0; x < width; x++) {
    let ink = 0
    for (let y = top; y <= bottom; y++) if (data[(y * width + x) * 4 + 3] > ALPHA_MIN) ink++
    if (ink > 0 && start === null) start = x
    if (ink === 0 && start !== null) {
      runs.push([start, x - 1])
      start = null
    }
  }
  if (start !== null) runs.push([start, width - 1])
  return runs
}

/**
 * sharp cannot chain trim() after extract() in a single pipeline — trim
 * recomputes its bounds against the original image and fails. Two passes.
 */
async function extractThenTrim(file, region) {
  const extracted = await sharp(file).extract(region).png().toBuffer()
  const trimmed = await sharp(extracted).trim({ threshold: 8 }).png().toBuffer()
  const meta = await sharp(trimmed).metadata()
  return { buffer: trimmed, height: meta.height, width: meta.width }
}

;(async () => {
  fs.mkdirSync(outDir, { recursive: true })

  const keyed = path.join(outDir, '.logo-keyed.png')
  await removeWhite(input, keyed)

  const img = await load(keyed)
  const bands = rowBands(img)

  if (bands.length < 3) {
    throw new Error(`Expected three bands in the lockup, found ${bands.length}`)
  }

  // Full lockup, trimmed — the library asset and social card.
  await sharp(keyed).trim({ threshold: 8 }).png().toFile(path.join(outDir, 'logo-lockup.png'))

  // Wordmark alone — header and footer. The "INTERIORS" descriptor below it is
  // illegible at the size a header logo is actually displayed at.
  const wordmarkBand = bands[0]
  const wordmark = await extractThenTrim(keyed, {
    height: wordmarkBand[1] - wordmarkBand[0] + 1,
    left: 0,
    top: wordmarkBand[0],
    width: img.width,
  })
  fs.writeFileSync(path.join(outDir, 'logo-wordmark.png'), wordmark.buffer)

  // The opening "m", for the favicon.
  const runs = columnRuns(img, wordmarkBand[0], wordmarkBand[1])
  const [mStart, mEnd] = runs[0]
  const mark = await extractThenTrim(keyed, {
    height: wordmarkBand[1] - wordmarkBand[0] + 1,
    left: mStart,
    top: wordmarkBand[0],
    width: mEnd - mStart + 1,
  })

  // A hairline glyph disappears at 16px, so the icon gets a solid tile and
  // generous padding.
  const TILE = 512
  const target = Math.round(TILE * 0.5)
  const scale = target / Math.max(mark.width, mark.height)

  const resized = await sharp(mark.buffer)
    .resize({ height: Math.round(mark.height * scale), width: Math.round(mark.width * scale) })
    .png()
    .toBuffer()
  const resizedMeta = await sharp(resized).metadata()

  await sharp({
    create: {
      background: { alpha: 1, b: 239, g: 244, r: 247 }, // --color-bone
      channels: 4,
      height: TILE,
      width: TILE,
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((TILE - resizedMeta.width) / 2),
        top: Math.round((TILE - resizedMeta.height) / 2),
      },
    ])
    .png()
    .toFile('src/app/icon.png')

  // 1200 × 630 social sharing card, composed from the lockup.
  const lockupMeta = await sharp(path.join(outDir, 'logo-lockup.png')).metadata()
  const cardWidth = Math.round(1200 * 0.66)
  const cardLockup = await sharp(path.join(outDir, 'logo-lockup.png'))
    .resize({ height: Math.round(lockupMeta.height * (cardWidth / lockupMeta.width)), width: cardWidth })
    .png()
    .toBuffer()
  const cardMeta = await sharp(cardLockup).metadata()

  await sharp({
    create: {
      background: { alpha: 1, b: 239, g: 244, r: 247 },
      channels: 4,
      height: 630,
      width: 1200,
    },
  })
    .composite([
      {
        input: cardLockup,
        left: Math.round((1200 - cardMeta.width) / 2),
        top: Math.round((630 - cardMeta.height) / 2),
      },
    ])
    .png()
    .toFile(path.join(outDir, 'og-default.png'))

  fs.rmSync(keyed)

  console.log('Wrote:')
  console.log(`  ${outDir}/logo-lockup.png`)
  console.log(`  ${outDir}/logo-wordmark.png  (${wordmark.width}x${wordmark.height})`)
  console.log(`  ${outDir}/og-default.png`)
  console.log('  src/app/icon.png')
  console.log('\nNow run: NODE_ENV=development pnpm seed')
})()
