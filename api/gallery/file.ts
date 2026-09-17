import { get } from '@vercel/blob'

export default async function handler(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return Response.json({ error: 'Missing photo name.' }, { status: 400 })
    }

    const blob = await get(name)

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
