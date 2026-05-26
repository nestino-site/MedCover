import { trafficEngineFetch } from '@/lib/api/client'

type RouteParams = { params: Promise<{ pageId: string }> }

export async function GET(_req: Request, { params }: RouteParams): Promise<Response> {
  const { pageId } = await params
  const numericId = Number(pageId)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return new Response('Invalid page id', { status: 400 })
  }

  try {
    const upstream = await trafficEngineFetch(`/content/${numericId}/hero-image`, {
      headers: { Accept: 'image/*' },
    })

    if (upstream.status === 404) {
      return new Response('Hero image not found', { status: 404 })
    }

    if (!upstream.ok) {
      return new Response('Failed to load hero image', { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/webp'
    const body = await upstream.arrayBuffer()

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new Response('Hero image unavailable', { status: 502 })
  }
}
