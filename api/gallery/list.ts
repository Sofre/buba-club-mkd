import { list } from '@vercel/blob'

export async function GET(request: Request): Promise<Response> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    return Response.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured.' }, { status: 500 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') ?? ''
    const { blobs } = await list({ prefix, token, abortSignal: controller.signal, limit: 1000 })
    const thumbnails = new Map(
      blobs
        .filter((blob) => blob.pathname.endsWith('-thumb.webp'))
        .map((blob) => [blob.pathname, blob.url]),
    )

    return Response.json({
      blobs: blobs
        .filter((blob) => !blob.pathname.endsWith('-thumb.webp'))
        .map((blob) => ({
        url: blob.url,
        name: blob.pathname,
        pathname: blob.pathname,
        thumbnailUrl: thumbnails.get(`${blob.pathname.replace(/\.[^.]+$/, '')}-thumb.webp`),
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        })),
    })
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'Vercel Blob request timed out.'
      : error instanceof Error
        ? error.message
        : 'Failed to list gallery photos.'
    return Response.json({ error: message }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
