import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { list, put } from '@vercel/blob'
import sharp from 'sharp'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))

const loadEnvLocal = () => {
  const envPath = resolve(rootDir, '.env.local')
  const contents = readFileSync(envPath, 'utf8')

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    const value = rawValue.trim().replace(/^"|"$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const token = process.env.BLOB_READ_WRITE_TOKEN
if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is missing from .env.local')
  process.exit(1)
}

const thumbnailPathnameFor = (pathname) => `${pathname.replace(/\.[^.]+$/, '')}-thumb.webp`

const run = async () => {
  const { blobs } = await list({ token, limit: 1000 })
  const existingPathnames = new Set(blobs.map((blob) => blob.pathname))

  const photosNeedingThumbnails = blobs.filter(
    (blob) => !blob.pathname.endsWith('-thumb.webp') && !existingPathnames.has(thumbnailPathnameFor(blob.pathname)),
  )

  console.log(`Found ${photosNeedingThumbnails.length} photo(s) without a thumbnail.`)

  let succeeded = 0
  let failed = 0

  for (const [index, blob] of photosNeedingThumbnails.entries()) {
    const thumbnailPathname = thumbnailPathnameFor(blob.pathname)
    console.log(`[${index + 1}/${photosNeedingThumbnails.length}] ${blob.pathname} -> ${thumbnailPathname}`)

    try {
      const response = await fetch(blob.url)
      if (!response.ok) {
        throw new Error(`failed to download original (status ${response.status})`)
      }

      const original = Buffer.from(await response.arrayBuffer())
      const thumbnail = await sharp(original)
        .resize(640, 640, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72 })
        .toBuffer()

      await put(thumbnailPathname, thumbnail, { access: 'public', token, contentType: 'image/webp' })
      succeeded += 1
    } catch (error) {
      failed += 1
      console.warn(`  Skipped: ${error instanceof Error ? error.message : error}`)
    }
  }

  console.log(`Done. Succeeded: ${succeeded}, failed: ${failed}.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
