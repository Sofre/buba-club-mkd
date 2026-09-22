
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { list, del, BlobServiceRateLimited } from '@vercel/blob'
import { setTimeout } from 'node:timers/promises'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))

/*
 * Load .env.local
 */
const envPath = resolve(rootDir, '.env.local')
const contents = readFileSync(envPath, 'utf8')

for (const line of contents.split(/\r?\n/)) {
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
  console.error('Missing BLOB_READ_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const BATCH_SIZE = 100
const DELAY_MS = 1000

async function deleteBatch(urls) {
  let attempt = 0
  const maxAttempts = 6

  while (true) {
    try {
      await del(urls, { token })
      return
    } catch (error) {
      attempt++

      if (attempt > maxAttempts) {
        throw error
      }

      let delay = 2000 * 2 ** (attempt - 1)

      if (error instanceof BlobServiceRateLimited) {
        delay = error.retryAfter * 1000
      }

      console.log(
        `Delete failed/rate limited. Retry ${attempt}/${maxAttempts} in ${delay}ms...`,
      )

      await setTimeout(delay)
    }
  }
}

async function deleteEverything() {
  let totalDeleted = 0

  console.log('========================================')
  console.log(' DELETE ALL BLOBS')
  console.log('========================================')
  console.log('')
  console.log('This permanently deletes Blob objects.')
  console.log('')

  while (true) {
    /*
     * IMPORTANT:
     *
     * Always start from the beginning.
     * Do NOT use a cursor while deleting.
     */
    const result = await list({
      token,
      limit: BATCH_SIZE,
    })

    if (result.blobs.length === 0) {
      break
    }

    const urls = result.blobs.map((blob) => blob.url)

    console.log(`Found ${result.blobs.length} blobs.`)

    console.log('First:')
    console.log(result.blobs[0].pathname)

    console.log('Last:')
    console.log(result.blobs[result.blobs.length - 1].pathname)

    await deleteBatch(urls)

    totalDeleted += urls.length

    console.log(`✅ Deleted ${urls.length}`)
    console.log(`Total deleted this run: ${totalDeleted}`)
    console.log('')

    await setTimeout(DELAY_MS)
  }

  console.log('========================================')
  console.log(' COMPLETE')
  console.log('========================================')
  console.log(`Total deleted: ${totalDeleted}`)
  console.log('Blob store is now empty.')
}

deleteEverything().catch((error) => {
  console.error('')
  console.error('❌ DELETE FAILED')
  console.error(error)
  process.exit(1)
})
