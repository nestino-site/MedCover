import type { BreadcrumbItem, ClinicDetail, FaqItem } from '@/lib/api/types'
import { buildBreadcrumbList, buildFAQPage, buildMedicalWebPage, buildOrganization } from '@/lib/schema/base'
import { synthesizeClinicAnswer } from './format'

export type ClinicSchemaParams = {
  clinic: ClinicDetail
  canonicalUrl: string
  faq?: FaqItem[]
  breadcrumbs?: BreadcrumbItem[]
  cityName?: string
  countryName?: string
  metaTitle?: string
  metaDescription?: string
  updatedAt?: string
}

export function buildClinicJsonLd(params: ClinicSchemaParams): Record<string, unknown>[] {
  const {
    clinic,
    canonicalUrl,
    faq,
    breadcrumbs,
    cityName = clinic.city?.name ?? '',
    countryName = clinic.country?.name ?? '',
    metaTitle,
    metaDescription,
    updatedAt,
  } = params

  const description =
    metaDescription ??
    clinic.editorialSummary ??
    clinic.shortDescription ??
    synthesizeClinicAnswer(clinic, cityName, countryName)

  const modifiedAt = updatedAt ?? clinic.updatedAt ?? clinic.publishedAt ?? new Date().toISOString()

  const medicalClinic: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': `${canonicalUrl}#clinic`,
    name: clinic.name,
    url: canonicalUrl,
    description,
    image: clinic.photoUrl ?? clinic.media?.[0]?.url ?? undefined,
    address: clinic.addressLine
      ? {
          '@type': 'PostalAddress',
          streetAddress: clinic.addressLine,
          addressLocality: clinic.city?.name ?? cityName,
          addressCountry: clinic.country?.name ?? countryName,
        }
      : undefined,
    telephone: clinic.phone ?? undefined,
    sameAs: [clinic.websiteUrl, clinic.googleMapsUrl].filter(Boolean),
  }

  if (clinic.googleRating != null) {
    medicalClinic.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: clinic.googleRating,
      reviewCount: clinic.googleReviewCount ?? undefined,
      bestRating: 5,
    }
  }

  const medicalWebPage = {
    '@context': 'https://schema.org',
    ...buildMedicalWebPage({
      url: canonicalUrl,
      name: metaTitle ?? `${clinic.name} | MedCover`,
      description,
      language: 'en',
      publishedAt: clinic.publishedAt ?? null,
      updatedAt: modifiedAt,
    }),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    mainEntity: { '@id': `${canonicalUrl}#clinic` },
    author: buildOrganization(),
    publisher: buildOrganization(),
  }

  const schemas: Record<string, unknown>[] = [medicalWebPage, medicalClinic]

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      ...buildBreadcrumbList(breadcrumbs),
    })
  }

  if (faq && faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      ...buildFAQPage(faq),
    })
  }

  return schemas
}
