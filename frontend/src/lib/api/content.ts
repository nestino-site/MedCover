import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { isTrafficEngineUnreachable, trafficEngineFetch } from './client'
import { normalizePagePayload } from './normalize-page-payload'
import {
  ContentPageSchemaV22,
  ContentListResponseSchema,
  type ContentPage,
  type ContentListItem,
} from './types'
import { cacheTags, type PublishedPagesFilterKey } from '../cache/tags'

const SITE_ID = process.env.SITE_ID ?? ''

export type ListPagesFilters = PublishedPagesFilterKey & {
  pageType?: string
}

function buildListPagesQuery(filters?: ListPagesFilters): string {
  if (!filters) return '/content/pages'
  const params = new URLSearchParams()
  if (filters.pageType) params.set('pageType', filters.pageType)
  if (filters.country) params.set('country', filters.country)
  if (filters.city) params.set('city', filters.city)
  if (filters.treatment) params.set('treatment', filters.treatment)
  const qs = params.toString()
  return qs ? `/content/pages?${qs}` : '/content/pages'
}

async function fetchPublishedPagesList(path: string): Promise<ContentListItem[]> {
  try {
    const res = await trafficEngineFetch(path)
    if (!res.ok) {
      console.warn(`[Traffic Engine] ${res.status} ${res.statusText} — ${path}`)
      return []
    }
    const json = await res.json()
    const parsed = ContentListResponseSchema.safeParse(json)
    if (!parsed.success) {
      console.error('[Traffic Engine] invalid list payload:', parsed.error.flatten())
      return []
    }
    return parsed.data.items ?? []
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      return []
    }
    throw error
  }
}

/** Canonical API slug: leading slash, no trailing slash. */
export function canonicalSlugPath(slug: string): string {
  const trimmed = slug.trim()
  const withLead = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLead.replace(/\/+$/, '') || '/'
}

function slugsMatch(a: string, b: string): boolean {
  return canonicalSlugPath(a) === canonicalSlugPath(b)
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
    console.warn(
      `[Traffic Engine] ${res.status} ${res.statusText} — ${label}`,
    )
    return { status: 'unavailable' }
  }

  let json: unknown
  try {
    json = await res.json()
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      console.warn(`[Traffic Engine] response body unreadable — ${label}`)
      return { status: 'unavailable' }
    }
    throw error
  }

  const parsed = ContentPageSchemaV22.safeParse(normalizePagePayload(json))
  if (!parsed.success) {
    console.error(
      `[Traffic Engine] invalid page payload for ${label}:`,
      parsed.error.flatten(),
    )
    return { status: 'invalid', error: parsed.error.message }
  }

  return { status: 'ok', page: parsed.data }
}

async function fetchPageRaw(path: string): Promise<PageFetchResult> {
  try {
    const res = await trafficEngineFetch(path)
    return parsePageResponse(res, path)
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      return { status: 'unavailable' }
    }
    throw error
  }
}

/**
 * Published page list — cached via Cache Components; invalidated by publish webhook.
 */
export async function listPublishedPages(
  filters?: ListPagesFilters,
): Promise<ContentListItem[]> {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.site(SITE_ID))
  if (filters && Object.keys(filters).length > 0) {
    cacheTag(cacheTags.publishedPagesFiltered(filters))
  }

  return fetchPublishedPagesList(buildListPagesQuery(filters))
}

/**
 * Load a published page — cached via Cache Components; invalidated by publish webhook.
 * Falls back to by-id when by-slug returns 404 (Nestino slug lookup quirk).
 */
export async function loadPublishedPage(slug: string): Promise<PageFetchResult> {
  'use cache'
  cacheLife('max')
  const canonical = canonicalSlugPath(slug)
  cacheTag(cacheTags.pageBySlug(canonical), cacheTags.site(SITE_ID))

  try {
    const bySlug = await fetchPageRaw(`/content/by-slug${canonical}`)
    if (bySlug.status === 'ok') {
      const listPageId = bySlug.page.pageId ?? (await resolveListPageId(canonical))
      return enrichPageWithListMetadata(bySlug, canonical, listPageId)
    }
    if (bySlug.status === 'invalid') return bySlug
    if (bySlug.status === 'unavailable') return bySlug

    const pages = await listPublishedPages()
    const item = pages.find((p) => slugsMatch(p.slug, canonical))
    if (item) {
      cacheTag(cacheTags.pageById(item.id))
      const byId = await fetchPageRaw(`/content/${item.id}`)
      if (byId.status === 'ok') {
        return enrichPageWithListMetadata(byId, canonical, item.id)
      }
      if (byId.status === 'invalid') return byId
      if (byId.status === 'unavailable') return byId
    }

    return bySlug
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      console.warn(`[Traffic Engine] loadPublishedPage failed — ${canonical}`)
      return { status: 'unavailable' }
    }
    throw error
  }
}

async function probeHeroImageExists(pageId: number): Promise<boolean> {
  try {
    const res = await trafficEngineFetch(`/content/${pageId}/hero-image`, {
      method: 'GET',
      headers: { Accept: 'image/*' },
      redirect: 'manual',
    })

    return res.ok || res.status === 301 || res.status === 302
  } catch {
    return false
  }
}

async function enrichPageWithListMetadata(
  result: Extract<PageFetchResult, { status: 'ok' }>,
  slug: string,
  knownPageId?: number,
): Promise<PageFetchResult> {
  const pageId = result.page.pageId ?? knownPageId ?? null
  const hasDirectUrl = Boolean(
    result.page.heroImage?.url?.trim() ||
      result.page.seo.og.image?.trim() ||
      result.page.seo.twitter.image?.trim(),
  )

  let hasHeroImage = result.page.hasHeroImage
  if (pageId && !hasDirectUrl && !hasHeroImage) {
    hasHeroImage = await probeHeroImageExists(pageId)
  }

  if (
    (pageId == null || pageId === result.page.pageId) &&
    hasHeroImage === result.page.hasHeroImage
  ) {
    return result
  }

  return {
    status: 'ok',
    page: {
      ...result.page,
      ...(pageId != null ? { pageId } : {}),
      hasHeroImage,
    },
  }
}

async function resolveListPageId(slug: string): Promise<number | undefined> {
  const pages = await listPublishedPages()
  return pages.find((page) => slugsMatch(page.slug, slug))?.id
}

export async function getPageBySlug(slug: string): Promise<ContentPage | null> {
  const result = await loadPublishedPage(slug)
  return result.status === 'ok' ? result.page : null
}

export async function listPublishedPagesSafe(): Promise<ContentListItem[]> {
  try {
    return await listPublishedPages()
  } catch {
    return []
  }
}

/** @deprecated Use listPublishedPagesSafe */
export const getContentListSafe = listPublishedPagesSafe

/** @deprecated Use getPageBySlug */
export const getContentBySlugOptional = getPageBySlug
