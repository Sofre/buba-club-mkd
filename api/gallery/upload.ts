import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return Response.json(
      { error: 'Missing BLOB_READ_WRITE_TOKEN environment variable for Vercel Blob uploads.' },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename') ?? `gallery-${Date.now()}.jpg`

  const body = await request.arrayBuffer()

  if (!body.byteLength) {
    return Response.json({ error: 'No file was sent.' }, { status: 400 })
  }

  try {
    const blob = await put(filename, body, {
      access: 'public',
      token,
    })
    const thumbnailFilename = `${filename.replace(/\.[^.]+$/, '')}-thumb.webp`
    const thumbnail = await sharp(body).resize(640, 640, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toBuffer()
    const thumbnailBlob = await put(thumbnailFilename, thumbnail, {
      access: 'public',
      token,
      contentType: 'image/webp',
    })

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      thumbnailUrl: thumbnailBlob.url,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image to Vercel Blob.'
    return Response.json({ error: message }, { status: 500 })
  }
}
