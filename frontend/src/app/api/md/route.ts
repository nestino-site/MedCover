import { NodeHtmlMarkdown } from 'node-html-markdown'
import type { NextRequest } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export async function GET(request: NextRequest): Promise<Response> {
  const path = request.nextUrl.searchParams.get('path') || '/'

  // Resolve the origin from the incoming request so this works in dev and prod.
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    new URL(SITE_URL).host
  const proto = request.headers.get('x-forwarded-proto') || new URL(SITE_URL).protocol.replace(':', '')
  const origin = `${proto}://${host}`

  const targetUrl = `${origin}${path}`

  let html: string
  try {
    const res = await fetch(targetUrl, {
      headers: {
        Accept: 'text/html',
        'x-md-internal': '1',
      },
    })
    if (!res.ok) {
      return new Response('Page not found', { status: res.status })
    }
    html = await res.text()
  } catch {
    return new Response('Failed to fetch page', { status: 502 })
  }

  const markdown = NodeHtmlMarkdown.translate(html)
  const tokenEstimate = Math.ceil(markdown.length / 4)

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(tokenEstimate),
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      Vary: 'Accept',
    },
  })
}
