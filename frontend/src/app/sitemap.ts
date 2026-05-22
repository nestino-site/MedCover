import type { MetadataRoute } from 'next'
import { listPublishedPages } from '@/lib/api/content'
import { filterPagesByLocale } from '@/lib/content/site-graph'
import { getSitemapHubs, hubPath } from '@/lib/content/site-nav'
import { LOCALES } from '@/lib/i18n/locales'
import { absoluteUrl, localizedPath } from '@/lib/i18n/paths'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pages: Awaited<ReturnType<typeof listPublishedPages>> = []

  try {
    pages = await listPublishedPages()
  } catch {
    return [{ url: SITE_URL, lastModified: new Date(), priority: 1.0 }]
  }

  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localizedPath('/', locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    })

    for (const hub of getSitemapHubs()) {
      entries.push({
        url: absoluteUrl(hubPath(hub.id, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: hub.id === 'treatments' || hub.id === 'guides' ? 0.9 : 0.85,
      })
    }

    const localePages = filterPagesByLocale(pages, locale)
    for (const page of localePages) {
      // Slugs from v2.1 API may include a leading slash — strip it for URL building
      const slugPath = page.slug.startsWith('/') ? page.slug : `/${page.slug}`
      const isCountryGuide = /^\/guides\/[^/]+-ivf-guide$/.test(slugPath)
      entries.push({
        url: absoluteUrl(localizedPath(slugPath, locale), SITE_URL),
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'monthly',
        priority: isCountryGuide ? 0.9 : 0.85,
      })
    }
  }

  return entries
}
