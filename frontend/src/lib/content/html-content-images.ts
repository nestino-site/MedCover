import { trafficEngineUrl } from '@/lib/api/client'

const IMG_SRC_RE = /<img\b([^>]*?\bsrc=["'])([^"']+)(["'][^>]*)>/gi
const A_HREF_RE = /<a\b([^>]*?\bhref=["'])([^"']+)(["'][^>]*)>/gi

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function normalizeInternalLinkHref(href: string): string {
  const trimmed = href.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed === '/') {
    return href
  }

  const hashIndex = trimmed.indexOf('#')
  const queryIndex = trimmed.indexOf('?')
  const endIndex = Math.min(
    hashIndex >= 0 ? hashIndex : trimmed.length,
    queryIndex >= 0 ? queryIndex : trimmed.length,
  )
  const pathPart = trimmed.slice(0, endIndex)
  const suffix = trimmed.slice(endIndex)

  if (pathPart.endsWith('/') || /\.[a-z0-9]{2,5}$/i.test(pathPart)) {
    return href
  }

  return `${pathPart}/${suffix}`
}

export function normalizeContentHtmlLinks(html: string): string {
  return html.replace(A_HREF_RE, (full, prefix, href, suffix) => {
    const normalized = normalizeInternalLinkHref(href)
    if (normalized === href) return full
    return `<a${prefix}${normalized}${suffix}>`
  })
}

function isBackendContentImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url, trafficEngineUrl())
    const base = new URL(trafficEngineUrl())
    if (parsed.origin !== base.origin) return false
    return /\/content\/\d+\/hero-image\/?$/i.test(parsed.pathname)
  } catch {
    return false
  }
}

function pageIdFromBackendHeroUrl(url: string): number | null {
  try {
    const parsed = new URL(url, trafficEngineUrl())
    const match = parsed.pathname.match(/\/content\/(\d+)\/hero-image\/?$/i)
    if (!match) return null
    const pageId = Number(match[1])
    return Number.isInteger(pageId) && pageId > 0 ? pageId : null
  } catch {
    return null
  }
}

export function buildHeroProxyUrl(pageId: number): string {
  return `/api/content/hero-image/${pageId}/`
}

export function rewriteBackendHeroUrl(url: string): string {
  const pageId = pageIdFromBackendHeroUrl(url)
  return pageId ? buildHeroProxyUrl(pageId) : url
}

export function extractFirstImageFromHtml(
  html: string | null | undefined,
): { url: string; alt: string; width: number; height: number } | null {
  if (!html) return null

  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
  if (!match?.[1]) return null

  const altMatch = match[0].match(/\balt=["']([^"']*)["']/i)
  const widthMatch = match[0].match(/\bwidth=["']?(\d+)["']?/i)
  const heightMatch = match[0].match(/\bheight=["']?(\d+)["']?/i)

  return {
    url: rewriteBackendHeroUrl(match[1].trim()),
    alt: altMatch?.[1]?.trim() ?? '',
    width: widthMatch ? Number(widthMatch[1]) : 1200,
    height: heightMatch ? Number(heightMatch[1]) : 630,
  }
}

/**
 * Rewrite protected Traffic Engine hero-image URLs to the local authenticated proxy.
 * Also resolves root-relative image paths against the site origin when provided.
 */
export function normalizeContentHtmlImages(
  html: string,
  siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medcover.io',
): string {
  return html.replace(IMG_SRC_RE, (full, prefix, src, suffix) => {
    const trimmed = src.trim()
    if (!trimmed) return full

    if (isBackendContentImageUrl(trimmed)) {
      return `<img${prefix}${rewriteBackendHeroUrl(trimmed)}${suffix}>`
    }

    if (trimmed.startsWith('//')) {
      return `<img${prefix}https:${trimmed}${suffix}>`
    }

    if (!isAbsoluteHttpUrl(trimmed) && trimmed.startsWith('/')) {
      const origin = siteOrigin.replace(/\/+$/, '')
      return `<img${prefix}${origin}${trimmed}${suffix}>`
    }

    return full
  })
}

/** Normalize backend HTML: hero image proxying + internal link trailing slashes. */
export function normalizeContentHtml(
  html: string,
  siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.medcover.io',
): string {
  return normalizeContentHtmlLinks(normalizeContentHtmlImages(html, siteOrigin))
}
