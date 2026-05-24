import type { ContentPage } from '../api/types'
import {
  buildBreadcrumbList,
  buildFAQPage,
  buildMedicalWebPage,
} from './base'
import { slugToLabel } from '../content/hubs'

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

  // Parse city/country from slug: guides/spain/barcelona-ivf-guide
  const slugMatch = page.slug.match(/^guides\/([^/]+)\/(.+)-ivf-guide$/)
  const countryKey = slugMatch?.[1] ?? null
  const cityKey = slugMatch?.[2] ?? null
  const cityName = cityKey ? slugToLabel(cityKey) : null
  const countryName = countryKey ? slugToLabel(countryKey) : null

  const speakableSpec = {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[data-speakable="true"]'],
  }

  // Enrich `about` with both MedicalProcedure + City entity
  const aboutEntities: object[] = [
    { '@type': 'MedicalProcedure', name: 'IVF (In Vitro Fertilization)' },
  ]
  if (cityName && countryName) {
    aboutEntities.push({
      '@type': 'City',
      name: cityName,
      containedInPlace: { '@type': 'Country', name: countryName },
    })
  }

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      ...medicalWebPage,
      about: aboutEntities,
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

  if (page.scores.seo != null) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'AggregateRating',
      ratingValue: Math.round(page.scores.seo),
      bestRating: 100,
      worstRating: 0,
      ratingCount: 1,
      reviewAspect: 'Verified Patient Data Quality',
    })
  }

  return schemas
}
