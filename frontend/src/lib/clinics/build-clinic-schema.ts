import type { ClinicDetail } from '@/lib/api/types'
import type { FaqItem } from '@/lib/api/types'

export function buildClinicJsonLd(
  clinic: ClinicDetail,
  canonicalUrl: string,
  faq?: FaqItem[],
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = []

  const medicalClinic: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    url: canonicalUrl,
    description: clinic.editorialSummary ?? clinic.shortDescription ?? undefined,
    image: clinic.photoUrl ?? clinic.media?.[0]?.url ?? undefined,
    address: clinic.addressLine
      ? {
          '@type': 'PostalAddress',
          streetAddress: clinic.addressLine,
          addressLocality: clinic.city?.name,
          addressCountry: clinic.country?.name,
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

  schemas.push(medicalClinic)

  if (faq && faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })
  }

  return schemas
}
