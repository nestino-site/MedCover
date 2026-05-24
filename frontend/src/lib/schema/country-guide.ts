import type { ContentPage } from '../api/types'
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildMedicalWebPage,
} from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

export function buildCountryGuideSchemas(page: ContentPage): object[] {
  const canonicalUrl = page.seo.canonicalUrl || `${SITE_URL}/${page.slug}/`

  const medicalWebPage = buildMedicalWebPage({
    url: canonicalUrl,
    name: page.metaTitle,
    description: page.metaDescription,
    language: page.language,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  })

  const faqPage = page.faq.length > 0 ? buildFAQPage(page.faq) : null

  const breadcrumbList =
    page.breadcrumbs.length > 0
      ? buildBreadcrumbList(page.breadcrumbs)
      : null

  const aggregateRating =
    page.scores.seo != null
      ? {
          '@type': 'AggregateRating',
          ratingValue: Math.round(page.scores.seo),
          bestRating: 100,
          worstRating: 0,
          ratingCount: 1,
          reviewAspect: 'Verified Patient Data Quality',
        }
      : null

  const speakableSpec = {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[data-speakable="true"]'],
  }

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      ...medicalWebPage,
      speakable: speakableSpec,
    },
  ]

  if (faqPage) {
    schemas.push({ '@context': 'https://schema.org', ...faqPage })
  }

  if (breadcrumbList) {
    schemas.push({ '@context': 'https://schema.org', ...breadcrumbList })
  }

  if (aggregateRating) {
    schemas.push({ '@context': 'https://schema.org', ...aggregateRating })
  }

  return schemas
}
