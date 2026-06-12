import type { Metadata } from 'next'
import {
  canonicalSlugPath,
  loadPublishedPage,
  type PageFetchResult,
} from '@/lib/api/content'
import type { ContentPage, ContentPageV22 } from '@/lib/api/types'
import { resolveHeroImageForMetadata } from '@/lib/content/hero-image'

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io').replace(/\/+$/, '')
}

export function resolveSiteCanonical(slugPath: string, apiCanonical?: string | null): string {
  const canonicalPath = slugPath.endsWith('/') ? slugPath : `${slugPath}/`
  const defaultCanonical = `${siteOrigin()}${canonicalPath}`

  if (!apiCanonical) return defaultCanonical

  try {
    const apiUrl = new URL(apiCanonical)
    if (apiUrl.host === new URL(siteOrigin()).host) {
      return apiCanonical.endsWith('/') ? apiCanonical : `${apiCanonical}/`
    }
  } catch {
    // Ignore malformed API canonical URLs.
  }

  return defaultCanonical
}

export function parseRobotsMeta(robotsMeta?: string | null): Metadata['robots'] {
  if (!robotsMeta?.trim()) return undefined
  const lower = robotsMeta.toLowerCase()
  const index = lower.includes('noindex') ? false : lower.includes('index') ? true : undefined
  const follow = lower.includes('nofollow') ? false : lower.includes('follow') ? true : undefined
  if (index === undefined && follow === undefined) return robotsMeta
  return { index, follow }
}

/** Next.js metadata from a published CMS page (single source of truth for SEO meta). */
export function metadataFromCmsPage(
  page: ContentPage,
  slugPath: string,
): Metadata {
  const canonical = resolveSiteCanonical(slugPath, page.seo.canonical)
  const hero = resolveHeroImageForMetadata(page, siteOrigin())

  return {
    title: page.seo.metaTitle ?? page.seo.title ?? undefined,
    description: page.seo.metaDescription ?? undefined,
    robots: parseRobotsMeta(page.seo.robotsMeta) ?? (page.seo.robotsMeta || 'index, follow'),
    alternates: { canonical },
    openGraph: {
      title: page.seo.og.title ?? page.seo.metaTitle ?? page.seo.title ?? undefined,
      description: page.seo.og.description ?? page.seo.metaDescription ?? undefined,
      url: resolveSiteCanonical(slugPath, page.seo.og.url ?? page.seo.canonical),
      type: page.seo.og.type === 'website' ? 'website' : 'article',
      siteName: 'MedCover',
      images: hero ? [{ url: hero.url, alt: hero.alt }] : [],
    },
    twitter: {
      card: page.seo.twitter.card,
      title: page.seo.twitter.title ?? page.seo.metaTitle ?? page.seo.title ?? undefined,
      description: page.seo.twitter.description ?? page.seo.metaDescription ?? undefined,
      images: hero ? [hero.url] : [],
    },
  }
}

export async function cmsMetadataForSlug(
  slugPath: string,
  fallback?: Metadata,
): Promise<Metadata> {
  const result = await loadPublishedPage(slugPath)
  if (result.status === 'ok') {
    return metadataFromCmsPage(result.page, slugPath)
  }
  return fallback ?? { title: 'MedCover' }
}

/** JSON-LD graphs from backend — never synthesize on the frontend when this is present. */
export function schemasFromCmsPage(page: ContentPage): unknown[] {
  const raw = page.schemaMarkup
  if (raw == null) return []
  return Array.isArray(raw) ? raw : [raw]
}

export function cmsPageJsonLdFromResult(result: PageFetchResult): unknown[] | null {
  if (result.status !== 'ok') return null
  const schemas = schemasFromCmsPage(result.page)
  return schemas.length > 0 ? schemas : null
}

/** AEO direct-answer text from payload v2.2 contentBlocks. */
export function heroAnswerFromCmsPage(page: ContentPageV22): string | undefined {
  const block = page.contentBlocks?.find((b) => b.type === 'hero_answer' || b.type === 'speakable')
  if (!block?.data) return undefined
  const text = block.data.text ?? block.data.answer ?? block.data.content
  return typeof text === 'string' && text.trim() ? text.trim() : undefined
}

export function breadcrumbsFromCmsPage(page: ContentPage) {
  return page.breadcrumbs.length > 0 ? page.breadcrumbs : undefined
}

export function faqFromCmsPage(page: ContentPage) {
  return page.faq.length > 0 ? page.faq : undefined
}

export function hubCopyFromCmsPage(page: ContentPage): {
  title?: string
  description?: string
  answer?: string
} {
  return {
    title: page.seo.title ?? page.seo.metaTitle ?? undefined,
    description: page.seo.metaDescription ?? undefined,
    answer: heroAnswerFromCmsPage(page),
  }
}

export async function loadCmsPage(slugPath: string): Promise<PageFetchResult> {
  return loadPublishedPage(canonicalSlugPath(slugPath))
}
