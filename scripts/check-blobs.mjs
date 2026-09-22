
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { list } from '@vercel/blob'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))

const loadEnvLocal = () => {
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
}

loadEnvLocal()

const token = process.env.BLOB_READ_WRITE_TOKEN

if (!token) {
  console.error('BLOB_READ_WRITE_TOKEN is missing from .env.local')
  process.exit(1)
}

const run = async () => {
  const { blobs } = await list({
    token,
    limit: 1000,
  })

  console.log(`Found ${blobs.length} blobs.\n`)

  for (const [index, blob] of blobs.entries()) {
    const pathname = blob.pathname

    console.log(`--- Blob ${index + 1} ---`)
    console.log('pathname:', pathname)
    console.log('url:', blob.url)
    console.log('contentType:', blob.contentType)
    console.log('size:', blob.size)

    console.log('contains +:', pathname.includes('+'))
    console.log('contains space:', pathname.includes(' '))
    console.log('decoded pathname:', decodeURIComponent(pathname))

    console.log()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

