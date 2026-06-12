export type PublishedPagesFilterKey = {
  pageType?: string
  country?: string
  city?: string
  treatment?: string
}

export const cacheTags = {
  pageBySlug: (slugPath: string) => `page-slug-${slugPath}`,
  pageById: (id: number | string) => `page-${id}`,
  publishedPages: 'published-pages',
  publishedPagesFiltered: (filters: PublishedPagesFilterKey) => {
    const parts = ['published-pages-filter']
    if (filters.pageType) parts.push(`pt-${filters.pageType}`)
    if (filters.country) parts.push(`c-${filters.country}`)
    if (filters.city) parts.push(`ci-${filters.city}`)
    if (filters.treatment) parts.push(`t-${filters.treatment}`)
    return parts.join('-')
  },
  hub: (segment: string) => `hub-${segment.replace(/^\//, '').replace(/\/$/, '')}`,
  site: (siteId: number | string) => `site-${siteId}`,
  taxonomy: 'taxonomy',
  clinics: (scope: string) => `clinics-${scope}`,
  costs: (treatment: string) => `costs-${treatment}`,
  search: 'search',
  compare: (key: string) => `compare-${key}`,
} as const
