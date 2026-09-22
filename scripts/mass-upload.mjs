import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, relative, extname } from 'node:path'
import { put } from '@vercel/blob'
import sharp from 'sharp'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))

/*
 * ============================================================
 * CHANGE THIS TO YOUR ORIGINAL ALBUMS FOLDER
 * ============================================================
 *
 * Example:
 *
 * D:/Bekap star disk/BUBAKLUB/albums
 */
const SOURCE_DIR = 'D:/Bekap star disk/BUBAKLUB/albums'

/*
 * Load .env.local
 */
const envPath = resolve(rootDir, '.env.local')
const envContents = readFileSync(envPath, 'utf8')

for (const line of envContents.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (!match) continue

  const [, key, rawValue] = match
  const value = rawValue.trim().replace(/^"|"$/g, '')

  if (!process.env[key]) {
    process.env[key] = value
  }
}

const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  console.error('❌ BLOB_READ_WRITE_TOKEN is missing from .env.local')
  process.exit(1)
}

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
])

/*
 * Find all original images recursively.
 */
function findImages(directory) {
  const results = []

  for (const entry of readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      results.push(...findImages(fullPath))
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = extname(entry.name).toLowerCase()

    if (!IMAGE_EXTENSIONS.has(extension)) {
      continue
    }

    /*
     * Don't upload thumbnails as originals.
     */
    if (entry.name.toLowerCase().endsWith('-thumb.webp')) {
      continue
    }

    results.push(fullPath)
  }

  return results
}

/*
 * Convert local Windows path to Blob pathname.
 *
 * IMPORTANT:
 * Spaces stay spaces.
 * We do NOT replace spaces with '+'.
 */
function blobPathFor(filePath) {
  const relativePath = relative(SOURCE_DIR, filePath)

  return `albums/${relativePath
    .replaceAll('\\', '/')}`
}

/*
 * Example:
 *
 * albums/2 rodenden buba klub/DSC06161.JPG
 *
 * becomes:
 *
 * albums/2 rodenden buba klub/DSC06161-thumb.webp
 */
function thumbnailPathFor(blobPath) {
  const extension = extname(blobPath)

  return `${blobPath.slice(0, -extension.length)}-thumb.webp`
}

async function verify(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`verification failed: HTTP ${response.status}`)
  }

  const data = await response.arrayBuffer()

  if (!data.byteLength) {
    throw new Error('verification returned 0 bytes')
  }

  return data.byteLength
}

async function run() {
  console.log('==========================================')
  console.log(' VERCEL BLOB PHOTO RECOVERY')
  console.log('==========================================')
  console.log()

  console.log('Source folder:')
  console.log(SOURCE_DIR)
  console.log()

  /*
   * Verify source directory.
   */
  try {
    if (!statSync(SOURCE_DIR).isDirectory()) {
      throw new Error('Not a directory')
    }
  } catch {
    console.error('❌ Source directory does not exist:')
    console.error(SOURCE_DIR)
    process.exit(1)
  }

  const files = findImages(SOURCE_DIR)

  console.log(`Found ${files.length} original image(s).`)
  console.log()

  if (!files.length) {
    console.log('Nothing to upload.')
    return
  }

  /*
   * Show the first 5 files before doing anything.
   */
  console.log('First files that will be uploaded:')
  console.log()

  for (const file of files.slice(0, 5)) {
    console.log(blobPathFor(file))
  }

  console.log()

  let succeeded = 0
  let failed = 0

  for (const [index, filePath] of files.entries()) {
    const blobPath = blobPathFor(filePath)
    const thumbnailPath = thumbnailPathFor(blobPath)

    console.log('------------------------------------------')
    console.log(`[${index + 1}/${files.length}]`)
    console.log(`LOCAL: ${filePath}`)
    console.log(`ORIGINAL: ${blobPath}`)
    console.log(`THUMBNAIL: ${thumbnailPath}`)

    try {
      const original = readFileSync(filePath)

      if (!original.length) {
        throw new Error('Local file is empty')
      }

      /*
       * Upload ORIGINAL.
       */
      const originalBlob = await put(blobPath, original, {
        access: 'public',
        token,
      })

      console.log('Original uploaded.')

      /*
       * Generate THUMBNAIL from local original.
       *
       * Sharp never touches the old Blob store.
       */
      const thumbnail = await sharp(original)
        .resize(640, 640, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 72,
        })
        .toBuffer()

      /*
       * Upload THUMBNAIL.
       */
      const thumbnailBlob = await put(thumbnailPath, thumbnail, {
        access: 'public',
        token,
        contentType: 'image/webp',
      })

      console.log('Thumbnail uploaded.')

      /*
       * Verify ORIGINAL.
       */
      const originalSize = await verify(originalBlob.url)

      /*
       * Verify THUMBNAIL.
       */
      const thumbnailSize = await verify(thumbnailBlob.url)

      console.log('✅ VERIFIED')
      console.log(`   Original:  ${originalSize} bytes`)
      console.log(`   Thumbnail: ${thumbnailSize} bytes`)

      succeeded++
    } catch (error) {
      failed++

      console.error('❌ FAILED')
      console.error(
        error instanceof Error
          ? error.message
          : error,
      )
    }
  }

  console.log()
  console.log('==========================================')
  console.log(' RECOVERY COMPLETE')
  console.log('==========================================')
  console.log(`Successful: ${succeeded}`)
  console.log(`Failed:     ${failed}`)
}

run().catch((error) => {
  console.error('')
  console.error('FATAL ERROR')
  console.error(error)
  process.exit(1)
})

