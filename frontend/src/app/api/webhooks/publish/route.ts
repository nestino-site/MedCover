import { revalidatePath, revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { canonicalSlugPath } from '@/lib/api/content'
import { cacheTags } from '@/lib/cache/tags'
import { normalizePath } from '@/lib/i18n/paths'

const REPLAY_WINDOW_MS = 5 * 60 * 1000
const ACCEPTED_EVENTS = new Set(['page.published', 'page.updated'])

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

/** Lightweight ping for connectivity checks (Railway → Vercel). Does not touch cache. */
export async function GET(): Promise<Response> {
  return Response.json({
    ok: true,
    route: 'webhooks/publish',
    method: 'POST',
    acceptsEvents: [...ACCEPTED_EVENTS],
  })
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/publish] WEBHOOK_SECRET not configured')
    return new Response('WEBHOOK_SECRET not configured', { status: 500 })
  }

  const body = await req.text()
  const signature =
    req.headers.get('x-publish-signature') ??
    req.headers.get('X-Publish-Signature') ??
    ''

  if (!verifySignature(body, signature, secret)) {
    console.warn('[webhook/publish] rejected: invalid signature')
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

  if (!ACCEPTED_EVENTS.has(payload.event)) {
    console.warn('[webhook/publish] unexpected event:', payload.event)
  }

  const slugPath = canonicalSlugPath(payload.slug)
  const publicPath = normalizePath(slugPath)

  revalidatePath(publicPath)
  revalidateTag(cacheTags.pageBySlug(slugPath), 'max')
  revalidateTag(cacheTags.pageById(payload.pageId), 'max')
  revalidateTag(cacheTags.publishedPages, 'max')
  revalidateTag(cacheTags.site(payload.siteId), 'max')

  const hubSegment = slugPath.split('/').filter(Boolean)[0]
  if (hubSegment) {
    revalidatePath(normalizePath(`/${hubSegment}`))
    revalidateTag(cacheTags.hub(hubSegment), 'max')
  }

  console.info('[webhook/publish] revalidated', {
    pageId: payload.pageId,
    slug: slugPath,
    siteId: payload.siteId,
    event: payload.event,
  })

  return Response.json({
    ok: true,
    slug: slugPath,
    path: publicPath,
    event: payload.event,
  })
}
