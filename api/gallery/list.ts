import { list } from '@vercel/blob'

export const revalidate = 3600

export async function GET(request: Request): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return Response.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured.' },
      { status: 500 },
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') ?? ''

    const allBlobs = []
    let cursor: string | undefined

    do {
      const result = await list({
        prefix,
        token,
        cursor,
        limit: 1000,
        abortSignal: controller.signal,
      })

      allBlobs.push(...result.blobs)
      cursor = result.cursor
    } while (cursor)

    const thumbnails = new Map(
      allBlobs
        .filter((blob) => blob.pathname.endsWith('-thumb.webp'))
        .map((blob) => [blob.pathname, blob.url]),
    )

    const photos = allBlobs
      .filter((blob) => !blob.pathname.endsWith('-thumb.webp'))
      .map((blob) => {
        const thumbnailPathname =
          `${blob.pathname.replace(/\.[^.]+$/, '')}-thumb.webp`

        return {
          url: blob.url,
          name: blob.pathname,
          pathname: blob.pathname,
          thumbnailUrl: thumbnails.get(thumbnailPathname),
          size: blob.size,
          uploadedAt: blob.uploadedAt,
        }
      })

    return Response.json(
      {
        blobs: photos,
      },
      {
        headers: {
          /*
           * During recovery, don't let an old cached response
           * hide newly uploaded photos.
           */
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Vercel Blob request timed out.'
        : error instanceof Error
          ? error.message
          : 'Failed to list gallery photos.'

    return Response.json(
      { error: message },
      { status: 500 },
    )
  } finally {
    clearTimeout(timeout)
  }
}

