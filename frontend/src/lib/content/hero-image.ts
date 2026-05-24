import type { ContentPage } from '@/lib/api/types'

export type ResolvedHeroImage = {
  url: string
  alt: string
  width: number
  height: number
}

/** Nestino sends hero on heroImage; OG/twitter often mirror the Cloudinary URL. */
export function resolveHeroImage(page: ContentPage): ResolvedHeroImage | null {
  const url =
    page.heroImage?.url?.trim() ||
    page.seo.og.image?.trim() ||
    page.seo.twitter.image?.trim() ||
    null

  if (!url) return null

  return {
    url,
    alt: page.heroImage?.alt ?? page.seo.metaTitle ?? page.seo.title ?? '',
    width: page.heroImage?.width ?? 1200,
    height: page.heroImage?.height ?? 630,
  }
}

export function isNextImageOptimizable(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === 'res.cloudinary.com' || host.endsWith('.cloudinary.com')
  } catch {
    return false
  }
}
