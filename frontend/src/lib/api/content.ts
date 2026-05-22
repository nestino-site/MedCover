import 'server-only'
import { cache } from 'react'
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

async function loadPublishedPageByIdFromList(
  slug: string,
  mode: 'cached' | 'no-store',
): Promise<PageFetchResult | null> {
  const target = canonicalSlugPath(slug)
  const pages = await listPublishedPagesSafe()
  const item = pages.find((p) => slugsMatch(p.slug, target))
  if (!item) return null

  const byId = await fetchPageById(item.id, mode)
  if (byId.status === 'ok' || byId.status === 'invalid') return byId
  return byId.status === 'unavailable' ? byId : null
}

/**
 * Load a published page through the Next.js Data Cache.
 * One cached by-slug attempt, then cached by-id from the published list.
 * No-store is only used after API unreachable on a cache miss.
 */
async function loadPublishedPageImpl(slug: string): Promise<PageFetchResult> {
  const canonical = canonicalSlugPath(slug)

  const bySlug = await fetchPageByPath(canonical, 'cached')
  if (bySlug.status === 'ok' || bySlug.status === 'invalid') return bySlug
  if (bySlug.status === 'unavailable') return bySlug

  const byIdCached = await loadPublishedPageByIdFromList(slug, 'cached')
  if (byIdCached) return byIdCached

  // Cold cache or webhook not yet run: one fresh fetch (not 4+ round trips).
  const freshSlug = await fetchPageByPath(canonical, 'no-store')
  if (freshSlug.status === 'ok' || freshSlug.status === 'invalid') return freshSlug

  const byIdFresh = await loadPublishedPageByIdFromList(slug, 'no-store')
  if (byIdFresh) return byIdFresh

  if (freshSlug.status === 'unavailable') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Traffic Engine] unreachable for ${canonical} — check API or env on Vercel.`,
      )
    }
    return freshSlug
  }

  return { status: 'not_found' }
}

/** Dedupes metadata + page body fetches within the same request. */
export const loadPublishedPage = cache(loadPublishedPageImpl)

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
