import { get } from '@vercel/blob'

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return Response.json({ error: 'Missing photo name.' }, { status: 400 })
    }

    const result = await get(name, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    if (!result) {
      return Response.json({ error: 'Photo not found.' }, { status: 404 })
    }

    const { blob } = result

    return Response.json({
      blob: {
        url: blob.url,
        name: blob.pathname,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch gallery photo.'
    return Response.json({ error: message }, { status: 500 })
  }
}
