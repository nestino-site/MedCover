import type { MetadataRoute } from 'next'
import { getContentList } from '@/lib/api/content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pages: Awaited<ReturnType<typeof getContentList>> = []

  try {
    pages = await getContentList()
  } catch {
    // Return minimal sitemap if API unavailable
    return [{ url: SITE_URL, lastModified: new Date(), priority: 1.0 }]
  }

  const guideEntries: MetadataRoute.Sitemap = pages.map((page) => {
    const isCountryGuide = /^guides\/[^/]+-ivf-guide$/.test(page.slug)
    return {
      url: `${SITE_URL}/${page.slug}/`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly',
      priority: isCountryGuide ? 0.9 : 0.85,
    }
  })

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/guides/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...guideEntries,
  ]
}
