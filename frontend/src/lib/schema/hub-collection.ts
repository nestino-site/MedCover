import type { FaqItem } from '../api/types'
import { buildBreadcrumbList, buildFAQPage, buildOrganization } from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export interface CollectionItem {
  name: string
  url: string
  description?: string
}

export function buildCollectionPage(params: {
  url: string
  name: string
  description: string
  items: CollectionItem[]
  faqs?: FaqItem[]
  breadcrumbs?: Array<{ name: string; slug: string; position: number }>
}): object[] {
  const { url, name, description, items, faqs = [], breadcrumbs = [] } = params

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#collection`,
      url,
      name,
      description,
      inLanguage: 'en',
      author: buildOrganization(),
      publisher: buildOrganization(),
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'MedCover',
        url: SITE_URL,
      },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '[data-speakable="true"]'],
      },
      mainEntity: {
        '@type': 'ItemList',
        name,
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          url: item.url,
          ...(item.description ? { description: item.description } : {}),
        })),
      },
    },
  ]

  if (breadcrumbs.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildBreadcrumbList(breadcrumbs) })
  }

  if (faqs.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildFAQPage(faqs) })
  }

  return schemas
}
