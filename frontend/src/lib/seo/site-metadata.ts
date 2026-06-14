import type { Metadata } from 'next'
import { en } from '@/lib/i18n/en'

export const SITE_NAME = 'MedCover'
export const SITE_TAGLINE = en.brand.tagline

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io').replace(/\/+$/, '')
}

export const DEFAULT_OG_IMAGE = {
  url: '/favicon-512x512.png',
  width: 512,
  height: 512,
  alt: `${SITE_NAME} — verified patient truth for IVF abroad`,
}

export type HubMetaKey = Exclude<keyof typeof en.meta, 'layout'>

const HUB_PATHS: Record<HubMetaKey, string> = {
  home: '/',
  countries: '/countries',
  cities: '/cities',
  treatments: '/treatments',
  guides: '/guides',
  clinics: '/clinics',
  costs: '/cost',
  compare: '/compare',
  start: '/start',
  about: '/about',
}

function absoluteSiteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${siteOrigin()}${normalized.endsWith('/') ? normalized : `${normalized}/`}`
}

function ogImageUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${siteOrigin()}${path.startsWith('/') ? path : `/${path}`}`
}

/** Default robots for public SEO pages (overrides stale CMS noindex on published content). */
export const INDEXABLE_PUBLIC_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}

/** Utility pages that must stay out of search results. */
export const NOINDEX_FOLLOW_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: true,
}

export function isIntentionallyNoindexPath(slugPath: string): boolean {
  const normalized = slugPath.replace(/\/+$/, '') || '/'
  return normalized === '/start'
}

/** /clinics/{country}/{city}/{clinic-slug} — fourth segment is not a treatment PLP. */
export function isClinicPdpSlugPath(slugPath: string): boolean {
  const parts = slugPath.replace(/^\//, '').replace(/\/+$/, '').split('/').filter(Boolean)
  return parts.length === 4 && parts[0] === 'clinics'
}

/** Site-wide defaults merged into every page unless overridden. */
export function siteMetadataDefaults(): Metadata {
  const image = {
    url: ogImageUrl(DEFAULT_OG_IMAGE.url),
    width: DEFAULT_OG_IMAGE.width,
    height: DEFAULT_OG_IMAGE.height,
    alt: DEFAULT_OG_IMAGE.alt,
  }

  return {
    metadataBase: new URL(siteOrigin()),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: siteOrigin() }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: 'health',
    keywords: [...en.meta.layout.keywords],
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@medcover',
      creator: '@medcover',
      images: [image.url],
    },
    robots: INDEXABLE_PUBLIC_ROBOTS,
  }
}

export type HubMetadataOptions = {
  path?: string
  robots?: Metadata['robots']
  /** Use absolute title (skip layout template). Default for home. */
  absoluteTitle?: boolean
}

/** Rich fallback metadata for hub and static pages from i18n copy. */
export function hubMetadata(key: HubMetaKey, options: HubMetadataOptions = {}): Metadata {
  const copy = en.meta[key]
  const path = options.path ?? HUB_PATHS[key]
  const canonical = absoluteSiteUrl(path)
  const useAbsoluteTitle = options.absoluteTitle ?? key === 'home'
  const imageUrl = ogImageUrl(DEFAULT_OG_IMAGE.url)

  const title =
    useAbsoluteTitle && key === 'home'
      ? { absolute: en.meta.layout.title }
      : copy.title

  const metadata: Metadata = {
    title,
    description: copy.description,
    alternates: { canonical },
    openGraph: {
      title: key === 'home' ? en.meta.layout.title : copy.title,
      description: copy.description,
      url: canonical,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: DEFAULT_OG_IMAGE.width,
          height: DEFAULT_OG_IMAGE.height,
          alt: DEFAULT_OG_IMAGE.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@medcover',
      title: key === 'home' ? en.meta.layout.title : copy.title,
      description: copy.description,
      images: [imageUrl],
    },
  }

  if (options.robots) {
    metadata.robots = options.robots
  }

  return metadata
}

export function hubPathForKey(key: HubMetaKey): string {
  return HUB_PATHS[key]
}

/** CMS hub slug with i18n fallback when the backend page is missing. */
export async function cmsHubMetadata(
  key: HubMetaKey,
  options: HubMetadataOptions = {},
): Promise<Metadata> {
  const { cmsMetadataForSlug } = await import('@/lib/seo/cms-seo')
  const path = options.path ?? HUB_PATHS[key]
  const fallback = hubMetadata(key, { ...options, path })
  const metadata = await cmsMetadataForSlug(path, fallback, { robots: options.robots })
  if (options.robots) {
    return { ...metadata, robots: options.robots }
  }
  return metadata
}

function isAbsoluteTitle(title: string): boolean {
  return title.includes('| MedCover') || title.startsWith('MedCover —') || title.startsWith('MedCover -')
}

/** Normalize CMS meta titles so the layout template does not double-append the brand. */
export function resolvePageTitle(title: string | null | undefined): Metadata['title'] {
  if (!title?.trim()) return undefined
  const trimmed = title.trim()
  return isAbsoluteTitle(trimmed) ? { absolute: trimmed } : trimmed
}
