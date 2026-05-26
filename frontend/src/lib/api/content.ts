import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { isTrafficEngineUnreachable, trafficEngineFetch } from './client'
import { normalizePagePayload } from './normalize-page-payload'
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
  const parsed = ContentPageSchema.safeParse(normalizePagePayload(json))
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
export async function listPublishedPages(): Promise<ContentListItem[]> {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.site(SITE_ID))

  try {
    const res = await trafficEngineFetch('/content/pages')
    if (!res.ok) {
      throw new Error(
        `Traffic Engine: ${res.status} ${res.statusText} — /content/pages`,
      )
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

/**
 * Load a published page — cached via Cache Components; invalidated by publish webhook.
 * Falls back to by-id when by-slug returns 404 (Nestino slug lookup quirk).
 */
export async function loadPublishedPage(slug: string): Promise<PageFetchResult> {
  'use cache'
  cacheLife('max')
  const canonical = canonicalSlugPath(slug)
  cacheTag(cacheTags.pageBySlug(canonical), cacheTags.site(SITE_ID))

  const bySlug = await fetchPageRaw(`/content/by-slug${canonical}`)
  if (bySlug.status === 'ok') {
    return enrichPageWithListMetadata(bySlug, canonical)
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
}

function enrichPageWithListMetadata(
  result: Extract<PageFetchResult, { status: 'ok' }>,
  _slug: string,
  knownPageId?: number,
): PageFetchResult {
  const pageId = result.page.pageId ?? knownPageId ?? null
  if (pageId == null || pageId === result.page.pageId) {
    return result
  }

  return {
    status: 'ok',
    page: {
      ...result.page,
      pageId,
    },
  }
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
