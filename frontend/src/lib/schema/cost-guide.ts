import type { ContentPage } from '../api/types'
import { buildBreadcrumbList, buildFAQPage, buildMedicalWebPage } from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

const TREATMENT_NAMES: Record<string, string> = {
  ivf: 'IVF (In Vitro Fertilization)',
  dental: 'Dental Treatment',
  hair: 'Hair Transplant',
  cosmetic: 'Cosmetic Surgery',
}

export function buildCostGuideSchemas(page: ContentPage, slug?: string): object[] {
  const canonicalUrl = page.seo.canonical || (slug ? `${SITE_URL}/${slug}/` : SITE_URL)

  const medicalWebPage = buildMedicalWebPage({
    url: canonicalUrl,
    name: page.seo.metaTitle ?? '',
    description: page.seo.metaDescription ?? '',
    language: page.language,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
  })

  const speakableSpec = {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[data-speakable="true"]'],
  }

  // Parse country + treatment from slug e.g. costs/spain-ivf-financing-2026
  const path = (slug ?? '').replace(/^costs\//, '')
  const treatmentIds = ['ivf', 'dental', 'hair', 'cosmetic']
  let countryKey: string | null = null
  let treatmentId: string | null = null
  for (const tid of treatmentIds) {
    const idx = path.indexOf(`-${tid}-`)
    if (idx !== -1) {
      countryKey = path.slice(0, idx)
      treatmentId = tid
      break
    }
  }

  const countryName = countryKey
    ? countryKey.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null
  const treatmentName = treatmentId ? (TREATMENT_NAMES[treatmentId] ?? treatmentId) : null

  const aboutEntities: object[] = []
  if (treatmentName) {
    aboutEntities.push({ '@type': 'MedicalProcedure', name: treatmentName })
  }
  if (countryName) {
    aboutEntities.push({ '@type': 'Country', name: countryName })
  }

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      ...medicalWebPage,
      ...(aboutEntities.length > 0 ? { about: aboutEntities } : {}),
      speakable: speakableSpec,
    },
  ]

  if (page.faq.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildFAQPage(page.faq) })
  }
  if (page.breadcrumbs.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildBreadcrumbList(page.breadcrumbs) })
  }
  return schemas
}
