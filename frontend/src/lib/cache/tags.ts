export const cacheTags = {
  page: (slug: string) => `page:${slug}`,
  contentList: 'content-list',
  allContent: 'all-content',
} as const
