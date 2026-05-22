export const cacheTags = {
  pageBySlug: (slugPath: string) => `page-slug-${slugPath}`,
  pageById: (id: number | string) => `page-${id}`,
  publishedPages: 'published-pages',
  site: (siteId: number | string) => `site-${siteId}`,
} as const
