import { revalidateTag } from 'next/cache'
import { createHmac, timingSafeEqual } from 'crypto'
import { cacheTags } from '@/lib/cache/tags'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env: ${key}`)
  return value
}

function verifyHmacSignature(body: string, signature: string): boolean {
  const secret = getRequiredEnv('REVALIDATE_SECRET')
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const expectedFull = `sha256=${expected}`

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedFull, 'utf8'),
    )
  } catch {
    return false
  }
}

interface WebhookPayload {
  event: string
  slug?: string
  pageId?: number
  updatedAt?: string
}

export async function POST(req: Request): Promise<Response> {
  const signature = req.headers.get('x-webhook-signature') ?? ''
  const body = await req.text()

  if (!verifyHmacSignature(body, signature)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, slug } = payload

  if (slug) {
    revalidateTag(cacheTags.page(slug), 'max')
  }

  if (
    event === 'page.created' ||
    event === 'page.deleted' ||
    event === 'page.published'
  ) {
    revalidateTag(cacheTags.contentList, 'max')
  }

  revalidateTag(cacheTags.allContent, 'max')

  return Response.json({
    revalidated: true,
    slug: slug ?? null,
    event,
    timestamp: new Date().toISOString(),
  })
}
