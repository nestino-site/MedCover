import type { MetadataRoute } from 'next'
import { listPublishedPages } from '@/lib/api/content'
import { filterPagesByLocale } from '@/lib/content/site-graph'
import { getSitemapHubs, hubPath } from '@/lib/content/site-nav'
import { staticCitiesPerCountry } from '@/lib/content/hubs'
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
      const hubPriority =
        hub.id === 'countries' ? 0.9
        : hub.id === 'treatments' ? 0.85
        : 0.8
      entries.push({
        url: absoluteUrl(hubPath(hub.id, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: hubPriority,
      })
    }

    entries.push({
      url: absoluteUrl(localizedPath('/about', locale), SITE_URL),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    })

    for (const countryKey of Object.keys(staticCitiesPerCountry)) {
      entries.push({
        url: absoluteUrl(localizedPath(`/countries/${countryKey}`, locale), SITE_URL),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      })
    }

    const localePages = filterPagesByLocale(pages, locale)
    for (const page of localePages) {
      const slugPath = page.slug.startsWith('/') ? page.slug : `/${page.slug}`
      const isCountryGuide = /^\/guides\/[^/]+-ivf-guide$/.test(slugPath)
      const isCityGuide = /^\/guides\/[^/]+\/.+-ivf-guide$/.test(slugPath)
      const isCostGuide = slugPath.startsWith('/costs/')
      entries.push({
        url: absoluteUrl(localizedPath(slugPath, locale), SITE_URL),
        lastModified: new Date(page.updatedAt),
        changeFrequency: isCountryGuide ? 'weekly' : 'monthly',
        priority: isCostGuide ? 0.8 : isCountryGuide ? 0.85 : isCityGuide ? 0.75 : 0.8,
      })
    }
  }

  return entries
}
