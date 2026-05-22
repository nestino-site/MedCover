import 'server-only'
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
  const slugPath = normalizePath(slug)
  const revalidate = revalidateSeconds()

  const res = await fetch(`${trafficEngineUrl()}/content/by-slug${slugPath}`, {
    headers: siteHeaders(),
    next: {
      revalidate,
      tags: [
        cacheTags.pageBySlug(slugPath),
        cacheTags.site(SITE_ID),
      ],
    },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Traffic Engine: ${res.status} ${res.statusText} — /content/by-slug${slugPath}`)
  }

  const json = await res.json()
  return ContentPageSchema.parse(json)
}

export async function listPublishedPages(): Promise<ContentListItem[]> {
  const revalidate = revalidateSeconds()

  const data = await apiFetch('/content/pages', ContentListResponseSchema, {
    next: {
      revalidate,
      tags: [
        cacheTags.publishedPages,
        cacheTags.site(SITE_ID),
      ],
    },
  } as RequestInit)

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
