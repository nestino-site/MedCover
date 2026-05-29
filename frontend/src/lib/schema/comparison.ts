import { buildBreadcrumbList, buildOrganization } from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

export function buildCompareHubSchema() {
  const url = `${SITE_URL}/compare/`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: 'Compare IVF Destinations Abroad — Side-by-Side Patient Data',
      description:
        'Compare IVF treatment costs, clinic quality, and patient outcomes across Spain, Greece, Czech Republic, Turkey, and more. Verified data — no sponsored results.',
      inLanguage: 'en',
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'MedCover',
        url: SITE_URL,
      },
      about: {
        '@type': 'MedicalProcedure',
        name: 'IVF (In Vitro Fertilization)',
      },
      audience: {
        '@type': 'MedicalAudience',
        audienceType: 'Patient',
      },
      publisher: buildOrganization(),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '[data-speakable="true"]'],
      },
    },
    {
      '@context': 'https://schema.org',
      ...buildBreadcrumbList([
        { name: 'Home', slug: '/', position: 1 },
        { name: 'Compare', slug: '/compare/', position: 2 },
      ]),
    },
  ]
}

export function buildComparisonDetailSchema(params: {
  url: string
  treatment: string
  locations: string[]
  publishedAt: string | null
  updatedAt: string
  description: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${params.url}#webpage`,
    url: params.url,
    name: params.locations
      .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
      .join(' vs ') + ` — ${params.treatment} Comparison`,
    description: params.description,
    inLanguage: 'en',
    datePublished: params.publishedAt ?? params.updatedAt,
    dateModified: params.updatedAt,
    lastReviewed: params.updatedAt,
    about: {
      '@type': 'MedicalProcedure',
      name: params.treatment,
    },
    author: buildOrganization(),
    publisher: buildOrganization(),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'MedCover',
      url: SITE_URL,
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }
}
