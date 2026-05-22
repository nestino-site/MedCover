import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { apiFetch, revalidateSeconds, siteHeaders, trafficEngineUrl } from './client'
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

export async function getPageBySlug(slug: string): Promise<ContentPage | null> {
  'use cache'
  const slugPath = normalizePath(slug)
  cacheTag(cacheTags.pageBySlug(slugPath), cacheTags.site(SITE_ID))
  cacheLife('days')

  const res = await fetch(`${trafficEngineUrl()}/content/by-slug${slugPath}`, {
    headers: siteHeaders(),
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Traffic Engine: ${res.status} ${res.statusText} — /content/by-slug${slugPath}`)
  }

  const json = await res.json()
  return ContentPageSchema.parse(json)
}

export async function listPublishedPages(): Promise<ContentListItem[]> {
  'use cache'
  cacheTag(cacheTags.publishedPages, cacheTags.site(SITE_ID))
  cacheLife('days')

  const data = await apiFetch('/content/pages', ContentListResponseSchema)
  return data.items ?? []
}

/** Safe variant — returns empty array instead of throwing when the API is unavailable. */
export async function listPublishedPagesSafe(): Promise<ContentListItem[]> {
  try {
    return await listPublishedPages()
  } catch {
    return []
  }
}
