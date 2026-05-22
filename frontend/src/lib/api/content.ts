import 'server-only'
import {
  apiFetch,
  isTrafficEngineUnreachable,
  revalidateSeconds,
  siteHeaders,
  trafficEngineUrl,
} from './client'
import {
  ContentPageSchema,
  ContentListResponseSchema,
  type ContentPage,
  type ContentListItem,
} from './types'
import { cacheTags } from '../cache/tags'

const SITE_ID = process.env.SITE_ID ?? ''

function normalizePath(slug: string): string {
  return slug.startsWith('/') ? slug : `/${slug}`
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

/**
 * Load a published page through the Next.js Data Cache.
 *
 * Flow:
 * 1. Backend publishes → webhook calls revalidateTag / revalidatePath
 * 2. First visit after publish → fetch Traffic Engine → response stored in cache
 * 3. Later visits → served from cache (no API call) until the next webhook
 *
 * Network failures are NOT cached and do not throw — callers handle `unavailable`.
 */
export async function loadPublishedPage(slug: string): Promise<PageFetchResult> {
  const slugPath = normalizePath(slug)

  try {
    const res = await fetch(`${trafficEngineUrl()}/content/by-slug${slugPath}`, {
      headers: siteHeaders(),
      next: fetchCacheOptions([
        cacheTags.pageBySlug(slugPath),
        cacheTags.site(SITE_ID),
      ]),
    })

    if (res.status === 404) return { status: 'not_found' }
    if (!res.ok) {
      throw new Error(
        `Traffic Engine: ${res.status} ${res.statusText} — /content/by-slug${slugPath}`,
      )
    }

    const json = await res.json()
    return { status: 'ok', page: ContentPageSchema.parse(json) }
  } catch (error) {
    if (isTrafficEngineUnreachable(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Traffic Engine] unreachable for ${slugPath} — no cache entry. Publish webhook or retry when API is up.`,
        )
      }
      return { status: 'unavailable' }
    }
    throw error
  }
}

/** @deprecated Use loadPublishedPage — returns page or null (404 and API-down both become null). */
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
