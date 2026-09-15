import { put } from '@vercel/blob'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename') ?? `gallery-${Date.now()}.jpg`

  const body = await request.arrayBuffer()

  if (!body.byteLength) {
    return Response.json({ error: 'No file was sent.' }, { status: 400 })
  }

  try {
    const blob = await put(filename, Buffer.from(body), {
      access: 'public',
    })

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image to Vercel Blob.'
    return Response.json({ error: message }, { status: 500 })
  }
}
