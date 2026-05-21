import 'server-only'
import { cacheTag, cacheLife } from 'next/cache'
import { apiFetch } from './client'
import {
  ContentPageSchema,
  ContentListSchema,
  type ContentPage,
  type ContentListItem,
} from './types'
import { cacheTags } from '../cache/tags'

export async function getContentBySlug(slug: string): Promise<ContentPage> {
  'use cache'
  cacheTag(cacheTags.page(slug), cacheTags.contentList)
  cacheLife('days')

  return apiFetch(`/api/v1/content/by-slug/${slug}`, ContentPageSchema)
}

export async function getContentList(): Promise<ContentListItem[]> {
  'use cache'
  cacheTag(cacheTags.contentList, cacheTags.allContent)
  cacheLife('days')

  const data = await apiFetch('/api/v1/content/pages', ContentListSchema)
  return data
}

/** For hub/listing pages — uncached; returns empty array when API is unavailable. */
export async function getContentListSafe(): Promise<ContentListItem[]> {
  try {
    return await apiFetch('/api/v1/content/pages', ContentListSchema)
  } catch {
    return []
  }
}

/** Uncached fetch for optional rendering when API may be offline (e.g. local build). */
export async function getContentBySlugOptional(slug: string): Promise<ContentPage | null> {
  try {
    return await apiFetch(`/api/v1/content/by-slug/${slug}`, ContentPageSchema)
  } catch {
    return null
  }
}
