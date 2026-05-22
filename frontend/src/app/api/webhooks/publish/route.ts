import { revalidatePath, revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cacheTags } from '@/lib/cache/tags'

const REPLAY_WINDOW_MS = 5 * 60 * 1000

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
  if (signature.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}

interface WebhookPayload {
  pageId: number
  slug: string
  siteId: number
  language: string
  event: 'page.published' | 'page.updated' | string
  timestamp: number
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) {
    return new Response('WEBHOOK_SECRET not configured', { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('x-publish-signature') ?? ''

  if (!verifySignature(body, signature, secret)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const timestampHeader = req.headers.get('x-publish-timestamp')
  if (timestampHeader) {
    const ts = Number(timestampHeader)
    if (!Number.isNaN(ts) && Date.now() - ts > REPLAY_WINDOW_MS) {
      return new Response('Webhook timestamp too old', { status: 400 })
    }
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(body) as WebhookPayload
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const slugPath = payload.slug.startsWith('/') ? payload.slug : `/${payload.slug}`

  revalidatePath(slugPath)
  revalidateTag(cacheTags.pageById(payload.pageId), 'max')
  revalidateTag(cacheTags.pageBySlug(slugPath), 'max')
  revalidateTag(cacheTags.publishedPages, 'max')
  revalidateTag(cacheTags.site(payload.siteId), 'max')

  return Response.json({
    ok: true,
    slug: slugPath,
    event: payload.event,
  })
}
