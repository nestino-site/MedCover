import type { ContentPage } from '../api/types'
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildMedicalWebPage,
} from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

export function buildCityGuideSchemas(page: ContentPage): object[] {
  const canonicalUrl = page.seo.canonicalUrl || `${SITE_URL}/${page.slug}/`

  const medicalWebPage = buildMedicalWebPage({
    url: canonicalUrl,
    name: page.metaTitle,
    description: page.metaDescription,
    language: page.language,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  })

  const speakableSpec = {
    '@type': 'SpeakableSpecification',
    cssSelector: ['[data-speakable="true"]'],
  }

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      ...medicalWebPage,
      speakable: speakableSpec,
    },
  ]

  if (page.faq.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildFAQPage(page.faq) })
  }

  if (page.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      ...buildBreadcrumbList(page.breadcrumbs),
    })
  }

  return schemas
}
