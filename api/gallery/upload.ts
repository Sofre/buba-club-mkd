import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 },
    )
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return Response.json(
      {
        error:
          'Missing BLOB_READ_WRITE_TOKEN environment variable for Vercel Blob uploads.',
      },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)

  const filename =
    searchParams.get('filename') ??
    `albums/gallery-${Date.now()}.jpg`

  /*
   * Only allow uploads inside albums/.
   */
  if (!filename.startsWith('albums/')) {
    return Response.json(
      {
        error: 'Filename must start with albums/.',
      },
      { status: 400 },
    )
  }

  const body = await request.arrayBuffer()

  if (!body.byteLength) {
    return Response.json(
      { error: 'No file was sent.' },
      { status: 400 },
    )
  }

  try {
    /*
     * Generate thumbnail from the ORIGINAL upload.
     *
     * Sharp does not download anything from Blob.
     */
    const thumbnail = await sharp(body)
      .resize(640, 640, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 72,
      })
      .toBuffer()

    /*
     * Upload original.
     */
    const blob = await put(filename, body, {
      access: 'public',
      token,
    })

    /*
     * Create thumbnail pathname.
     *
     * Example:
     *
     * albums/My Album/photo.jpg
     *
     * becomes:
     *
     * albums/My Album/photo-thumb.webp
     */
    const thumbnailFilename =
      `${filename.replace(/\.[^.]+$/, '')}-thumb.webp`

    /*
     * Upload thumbnail.
     */
    const thumbnailBlob = await put(
      thumbnailFilename,
      thumbnail,
      {
        access: 'public',
        token,
        contentType: 'image/webp',
      },
    )

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      thumbnailUrl: thumbnailBlob.url,
      thumbnailPathname: thumbnailBlob.pathname,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to upload image to Vercel Blob.'

    return Response.json(
      { error: message },
      { status: 500 },
    )
  }
}

