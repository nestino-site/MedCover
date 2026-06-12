import type { Metadata } from 'next'
import {
  canonicalSlugPath,
  loadPublishedPage,
  type PageFetchResult,
} from '@/lib/api/content'
import type { ContentPage, ContentPageV22 } from '@/lib/api/types'
import { resolveHeroImageForMetadata } from '@/lib/content/hero-image'
import {
  DEFAULT_OG_IMAGE,
  resolvePageTitle,
  siteMetadataDefaults,
  siteOrigin,
} from '@/lib/seo/site-metadata'

export { siteOrigin }

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

function defaultShareImage(origin: string) {
  return {
    url: `${origin}${DEFAULT_OG_IMAGE.url}`,
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
    alt: DEFAULT_OG_IMAGE.alt,
  }
}

function mergeMetadata(fallback: Metadata, cms: Metadata): Metadata {
  return {
    ...fallback,
    ...cms,
    openGraph: { ...fallback.openGraph, ...cms.openGraph },
    twitter: { ...fallback.twitter, ...cms.twitter },
    alternates: { ...fallback.alternates, ...cms.alternates },
  }
}

/** Next.js metadata from a published CMS page (single source of truth for SEO meta). */
export function metadataFromCmsPage(
  page: ContentPage,
  slugPath: string,
  fallback?: Metadata,
): Metadata {
  const origin = siteOrigin()
  const canonical = resolveSiteCanonical(slugPath, page.seo.canonical)
  const hero = resolveHeroImageForMetadata(page, origin)
  const shareImage = hero ?? defaultShareImage(origin)
  const pageTitle = page.seo.metaTitle ?? page.seo.title
  const pageDescription = page.seo.metaDescription ?? undefined
  const ogTitle = page.seo.og.title ?? pageTitle ?? undefined
  const ogDescription = page.seo.og.description ?? pageDescription
  const twitterTitle = page.seo.twitter.title ?? pageTitle ?? undefined
  const twitterDescription = page.seo.twitter.description ?? pageDescription

  const cms: Metadata = {
    title: resolvePageTitle(pageTitle),
    description: pageDescription,
    robots: parseRobotsMeta(page.seo.robotsMeta) ?? (page.seo.robotsMeta || 'index, follow'),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: resolveSiteCanonical(slugPath, page.seo.og.url ?? page.seo.canonical),
      type: page.seo.og.type === 'website' ? 'website' : 'article',
      siteName: 'MedCover',
      locale: 'en_US',
      images: [{ url: shareImage.url, alt: shareImage.alt ?? DEFAULT_OG_IMAGE.alt }],
    },
    twitter: {
      card: page.seo.twitter.card,
      site: '@medcover',
      title: twitterTitle,
      description: twitterDescription,
      images: [shareImage.url],
    },
  }

  return fallback ? mergeMetadata(fallback, cms) : cms
}

export async function cmsMetadataForSlug(
  slugPath: string,
  fallback?: Metadata,
): Promise<Metadata> {
  const base = { ...siteMetadataDefaults(), ...fallback }
  const result = await loadPublishedPage(slugPath)
  if (result.status === 'ok') {
    return metadataFromCmsPage(result.page, slugPath, base)
  }
  return base
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
