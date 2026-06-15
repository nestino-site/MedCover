import type { ContentPage } from '@/lib/api/types'
import {
  buildHeroProxyUrl,
  extractFirstImageFromHtml,
  rewriteBackendHeroUrl,
} from '@/lib/content/html-content-images'

export type ResolvedHeroImage = {
  url: string
  alt: string
  width: number
  height: number
}

function resolveAlt(page: ContentPage): string {
  return page.heroImage?.alt ?? page.seo.metaTitle ?? page.seo.title ?? ''
}

function resolveDimensions(page: ContentPage): { width: number; height: number } {
  return {
    width: page.heroImage?.width ?? 1200,
    height: page.heroImage?.height ?? 630,
  }
}

/** Nestino sends hero on heroImage; OG/twitter often mirror the Cloudinary URL. */
export function resolveHeroImage(page: ContentPage): ResolvedHeroImage | null {
  const directUrl = [
    page.heroImage?.url,
    page.seo.og.image,
    page.seo.twitter.image,
  ]
    .map((value) => value?.trim())
    .find(Boolean)

  if (directUrl) {
    const { width, height } = resolveDimensions(page)
    return {
      url: rewriteBackendHeroUrl(directUrl),
      alt: resolveAlt(page),
      width,
      height,
    }
  }

  if (page.pageId && page.hasHeroImage) {
    const { width, height } = resolveDimensions(page)
    return {
      url: buildHeroProxyUrl(page.pageId),
      alt: resolveAlt(page),
      width,
      height,
    }
  }

  const inlineImage = extractFirstImageFromHtml(page.htmlContent)
  if (inlineImage) {
    return inlineImage
  }

  return null
}

export function resolveHeroImageForMetadata(
  page: ContentPage,
  siteUrl: string,
): ResolvedHeroImage | null {
  const hero = resolveHeroImage(page)
  if (!hero) return null

  if (hero.url.startsWith('/')) {
    const origin = siteUrl.replace(/\/+$/, '')
    return { ...hero, url: `${origin}${hero.url}` }
  }

  return hero
}

