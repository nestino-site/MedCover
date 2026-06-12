import { revalidatePath, revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { canonicalSlugPath } from '@/lib/api/content'
import { cacheTags } from '@/lib/cache/tags'
import { normalizePath } from '@/lib/i18n/paths'
import { parseCompareSlug } from '@/lib/routes'

const REPLAY_WINDOW_MS = 5 * 60 * 1000
const ACCEPTED_EVENTS = new Set([
  'page.published',
  'page.updated',
  'clinic.updated',
  'clinic.published',
])

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
  pageId?: number
  slug?: string
  siteId: number
  language?: string
  event: string
  timestamp: number
  pageType?: string
  affectedPaths?: string[]
  clinicId?: number
}

function revalidateClinicScopeTags(path: string) {
  const match = path.replace(/^\//, '').match(/^clinics\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?/)
  if (!match) return
  const [, country, city, clinicSlug] = match
  revalidateTag(cacheTags.clinics(country), 'max')
  if (city) {
    revalidateTag(cacheTags.clinics(`${country}-${city}`), 'max')
  }
  if (city && clinicSlug) {
    revalidateTag(cacheTags.clinics(`${country}-${city}-${clinicSlug}`), 'max')
  }
}

function revalidateCostScopeTags(path: string) {
  const match = path.replace(/^\//, '').match(/^cost\/([^/]+)/)
  if (match) {
    revalidateTag(cacheTags.costs(match[1]), 'max')
  }
}

function revalidateCompareScopeTags(path: string) {
  const match = path.replace(/^\//, '').match(/^compare\/(.+)/)
  if (!match) return
  const tail = match[1].replace(/\/$/, '')
  const parsed = parseCompareSlug(tail)
  if (parsed?.treatment) {
    revalidateTag(
      cacheTags.compare(`country-${parsed.entityA}-${parsed.entityB}-${parsed.treatment}`),
      'max',
    )
    revalidateTag(
      cacheTags.compare(`city-${parsed.entityA}-${parsed.entityB}-${parsed.treatment}`),
      'max',
    )
    return
  }
  if (parsed) {
    revalidateTag(cacheTags.compare(`clinic-${parsed.entityA}-${parsed.entityB}-`), 'max')
  }
}

function revalidateFromPath(publicPath: string, slugPath?: string) {
  revalidatePath(publicPath)

  if (slugPath) {
    revalidateTag(cacheTags.pageBySlug(slugPath), 'max')
  }

  const hubSegment = publicPath.split('/').filter(Boolean)[0]
  if (hubSegment) {
    revalidatePath(normalizePath(`/${hubSegment}`))
    revalidateTag(cacheTags.hub(hubSegment), 'max')
  }

  revalidateClinicScopeTags(publicPath)
  revalidateCostScopeTags(publicPath)
  revalidateCompareScopeTags(publicPath)
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

  const slugPath = payload.slug ? canonicalSlugPath(payload.slug) : undefined
  const primaryPath = normalizePath(slugPath ?? payload.affectedPaths?.[0] ?? '/')
  const pathsToRevalidate = payload.affectedPaths?.length
    ? payload.affectedPaths.map((p) => normalizePath(p))
    : [primaryPath]

  for (const publicPath of pathsToRevalidate) {
    revalidateFromPath(publicPath, slugPath)
  }

  revalidateTag(cacheTags.taxonomy, 'max')
  revalidateTag(cacheTags.publishedPages, 'max')
  revalidateTag(cacheTags.site(payload.siteId), 'max')
  revalidateTag(cacheTags.search, 'max')

  if (payload.pageId != null) {
    revalidateTag(cacheTags.pageById(payload.pageId), 'max')
  }

  console.info('[webhook/publish] revalidated', {
    pageId: payload.pageId,
    slug: slugPath,
    affectedPaths: pathsToRevalidate,
    siteId: payload.siteId,
    event: payload.event,
  })

  return Response.json({
    ok: true,
    slug: slugPath,
    paths: pathsToRevalidate,
    event: payload.event,
  })
}
