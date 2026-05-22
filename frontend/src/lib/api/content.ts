import 'server-only'
import {
  apiFetch,
  isTrafficEngineUnreachable,
  revalidateSeconds,
  trafficEngineFetch,
} from './client'
import {
  ContentPageSchema,
  ContentListResponseSchema,
  type ContentPage,
  type ContentListItem,
} from './types'
import { cacheTags } from '../cache/tags'

const SITE_ID = process.env.SITE_ID ?? ''

/** Canonical API slug: leading slash, no trailing slash. */
export function canonicalSlugPath(slug: string): string {
  const trimmed = slug.trim()
  const withLead = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLead.replace(/\/+$/, '') || '/'
}

function slugVariants(slugPath: string): string[] {
  const canonical = canonicalSlugPath(slugPath)
  const noLead = canonical.replace(/^\//, '')
  return [...new Set([canonical, `/${noLead}`, noLead, `${canonical}/`])]
}

function slugsMatch(a: string, b: string): boolean {
  return canonicalSlugPath(a) === canonicalSlugPath(b)
}

function fetchCacheOptions(tags: string[]) {
  return {
    revalidate: revalidateSeconds(),
    tags,
  }
}

export type PageFetchResult =
  | { status: 'ok'; page: ContentPage }
  | { status: 'not_found' }
  | { status: 'unavailable' }
  | { status: 'invalid'; error: string }

async function parsePageResponse(
  res: Response,
  label: string,
): Promise<PageFetchResult> {
  if (res.status === 404) return { status: 'not_found' }
  if (!res.ok) {
    throw new Error(
      `Traffic Engine: ${res.status} ${res.statusText} — ${label}`,
    )
  }

  const json = await res.json()
  const parsed = ContentPageSchema.safeParse(json)
  if (!parsed.success) {
    console.error(
      `[Traffic Engine] invalid page payload for ${label}:`,
      parsed.error.flatten(),
    )
    return { status: 'invalid', error: parsed.error.message }
  }

  return { status: 'ok', page: parsed.data }
}

async function fetchPageByPath(
  slugPath: string,
  mode: 'cached' | 'no-store',
): Promise<PageFetchResult> {
  const canonical = canonicalSlugPath(slugPath)

  try {
    const res = await trafficEngineFetch(`/content/by-slug${canonical}`, {
      ...(mode === 'cached'
        ? {
            next: fetchCacheOptions([
              cacheTags.pageBySlug(canonical),
              cacheTags.site(SITE_ID),
            ]),
          }
        : { cache: 'no-store' }),
    })

    return parsePageResponse(res, `/content/by-slug${canonical}`)
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      return { status: 'unavailable' }
    }
    throw error
  }
}

async function fetchPageById(
  pageId: number,
  mode: 'cached' | 'no-store',
): Promise<PageFetchResult> {
  try {
    const res = await trafficEngineFetch(`/content/${pageId}`, {
      ...(mode === 'cached'
        ? {
            next: fetchCacheOptions([
              cacheTags.pageById(pageId),
              cacheTags.site(SITE_ID),
            ]),
          }
        : { cache: 'no-store' }),
    })

    return parsePageResponse(res, `/content/${pageId}`)
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      return { status: 'unavailable' }
    }
    throw error
  }
}

/**
 * Load a published page through the Next.js Data Cache.
 * Tries cached fetch first, then fresh no-store retries with slug variants.
 */
export async function loadPublishedPage(slug: string): Promise<PageFetchResult> {
  const variants = slugVariants(slug)
  let lastResult: PageFetchResult = { status: 'not_found' }

  for (const variant of variants) {
    const cached = await fetchPageByPath(variant, 'cached')
    if (cached.status === 'ok') return cached
    if (cached.status === 'invalid') return cached
    if (cached.status === 'unavailable') {
      lastResult = cached
      break
    }
    lastResult = cached
  }

  for (const variant of variants) {
    const fresh = await fetchPageByPath(variant, 'no-store')
    if (fresh.status === 'ok') return fresh
    if (fresh.status === 'invalid') return fresh
    if (fresh.status === 'unavailable') return fresh
    lastResult = fresh
  }

  if (lastResult.status === 'not_found') {
    const target = canonicalSlugPath(slug)
    const pages = await listPublishedPagesSafe()
    const item = pages.find((p) => slugsMatch(p.slug, target))
    if (item) {
      const byId = await fetchPageById(item.id, 'no-store')
      if (byId.status === 'ok' || byId.status === 'invalid') return byId
      lastResult = byId
    }
  }

  if (lastResult.status === 'unavailable' && process.env.NODE_ENV === 'development') {
    console.warn(
      `[Traffic Engine] unreachable for ${canonicalSlugPath(slug)} — check API or env on Vercel.`,
    )
  }

  return lastResult
}

export async function getPageBySlug(slug: string): Promise<ContentPage | null> {
  const result = await loadPublishedPage(slug)
  return result.status === 'ok' ? result.page : null
}

export async function listPublishedPages(): Promise<ContentListItem[]> {
  try {
    const data = await apiFetch('/content/pages', ContentListResponseSchema, {
      next: fetchCacheOptions([cacheTags.publishedPages, cacheTags.site(SITE_ID)]),
    } as RequestInit)
    return data.items ?? []
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      return []
    }
    throw error
  }
}

export async function listPublishedPagesSafe(): Promise<ContentListItem[]> {
  try {
    return await listPublishedPages()
  } catch {
    return []
  }
}
