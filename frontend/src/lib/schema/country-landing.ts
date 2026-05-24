import type { FaqItem } from '../api/types'
import type { CityDisplay } from '../content/hubs'
import { buildBreadcrumbList, buildFAQPage, buildOrganization } from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://medcover.com'

// Wikidata sameAs identifiers for supported countries
const COUNTRY_WIKIDATA: Record<string, string> = {
  spain: 'https://www.wikidata.org/wiki/Q29',
  greece: 'https://www.wikidata.org/wiki/Q41',
  'czech-republic': 'https://www.wikidata.org/wiki/Q213',
  turkey: 'https://www.wikidata.org/wiki/Q43',
  portugal: 'https://www.wikidata.org/wiki/Q45',
  'north-macedonia': 'https://www.wikidata.org/wiki/Q221',
}

export interface CountryLandingSchemaParams {
  countryKey: string
  countryName: string
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  faqs: FaqItem[]
  cities: CityDisplay[]
  updatedAt?: string
}

export function buildCountryLandingSchemas(params: CountryLandingSchemaParams): object[] {
  const { countryKey, countryName, metaTitle, metaDescription, canonicalUrl, faqs, cities, updatedAt } = params
  const now = updatedAt ?? new Date().toISOString()

  const countryEntity = {
    '@type': 'Country',
    name: countryName,
    ...(COUNTRY_WIKIDATA[countryKey] ? { sameAs: COUNTRY_WIKIDATA[countryKey] } : {}),
  }

  const medicalWebPage = {
    '@type': 'MedicalWebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: metaTitle,
    description: metaDescription,
    inLanguage: 'en',
    dateModified: now,
    lastReviewed: now,
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
    about: [
      countryEntity,
      {
        '@type': 'MedicalProcedure',
        name: 'IVF (In Vitro Fertilization)',
        procedureType: { '@type': 'MedicalProcedureType', name: 'Therapeutic procedure' },
      },
    ],
    specialty: { '@type': 'MedicalSpecialty', name: 'Obstetrics' },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Countries', path: '/countries' },
    { name: countryName, path: `/countries/${countryKey}` },
  ]

  const schemas: object[] = [
    { '@context': 'https://schema.org', ...medicalWebPage },
    { '@context': 'https://schema.org', ...buildBreadcrumbList(breadcrumbs) },
  ]

  if (faqs.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildFAQPage(faqs) })
  }

  if (cities.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `IVF City Guides in ${countryName}`,
      description: `City-level IVF guides for ${countryName}`,
      itemListElement: cities.map((city, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `IVF in ${city.cityName}`,
        url: `${SITE_URL}${city.href}`,
      })),
    })
  }

  return schemas
}
