import { list } from '@vercel/blob'

export default async function handler(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('prefix') ?? ''
    const { blobs } = await list({ prefix })

    return Response.json({
      blobs: blobs.map((blob) => ({
        url: blob.url,
        name: blob.pathname,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list gallery photos.'
    return Response.json({ error: message }, { status: 500 })
  }
}
