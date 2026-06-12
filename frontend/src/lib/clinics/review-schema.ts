import type { ClinicDetail } from '@/lib/api/types'
import { reviewTimestampToIso } from './format'

const SCHEMA_REVIEW_LIMIT = 10

type GoogleReview = NonNullable<ClinicDetail['googleReviews']>[number]

function eligibleReviews(reviews: ClinicDetail['googleReviews'] | undefined): GoogleReview[] {
  return (reviews ?? []).filter(
    (review) => Boolean(review.text?.trim()) && Boolean(review.authorName?.trim()),
  )
}

function buildAggregateRating(
  clinic: ClinicDetail,
  visibleReviewCount: number,
): Record<string, unknown> | undefined {
  if (clinic.googleRating == null) return undefined

  return {
    '@type': 'AggregateRating',
    ratingValue: clinic.googleRating,
    reviewCount: clinic.googleReviewCount ?? visibleReviewCount,
    bestRating: 5,
    worstRating: 1,
  }
}

function buildReviewSchemaItems(
  reviews: GoogleReview[],
  canonicalUrl?: string,
): Record<string, unknown>[] {
  return reviews.slice(0, SCHEMA_REVIEW_LIMIT).map((review, index) => {
    const reviewId = canonicalUrl
      ? `${canonicalUrl}#google-review-${index + 1}`
      : `#google-review-${index + 1}`
    const item: Record<string, unknown> = {
      '@type': 'Review',
      '@id': reviewId,
      author: {
        '@type': 'Person',
        name: review.authorName,
      },
      reviewBody: review.text?.trim(),
      publisher: {
        '@type': 'Organization',
        name: 'Google',
      },
    }

    if (review.rating != null) {
      item.reviewRating = {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      }
    }

    const datePublished = reviewTimestampToIso(review.time)
    if (datePublished) {
      item.datePublished = datePublished
    }

    return item
  })
}

/** Attach aggregateRating + individual Review items to a MedicalClinic entity. */
export function applyGoogleReviewSchemaFields(
  entity: Record<string, unknown>,
  clinic: ClinicDetail,
  canonicalUrl?: string,
): void {
  const reviews = eligibleReviews(clinic.googleReviews)
  const aggregateRating = buildAggregateRating(clinic, reviews.length)
  const reviewItems = buildReviewSchemaItems(reviews, canonicalUrl)

  if (aggregateRating) {
    entity.aggregateRating = aggregateRating
  }
  if (reviewItems.length > 0) {
    entity.review = reviewItems
  }
}

/**
 * Supplemental JSON-LD when CMS provides its own page schema but not review markup.
 * Uses the same @id as the main MedicalClinic entity for graph merging.
 */
export function buildClinicReviewsJsonLd(
  clinic: ClinicDetail,
  canonicalUrl: string,
): Record<string, unknown> | null {
  const reviews = eligibleReviews(clinic.googleReviews)
  if (clinic.googleRating == null && reviews.length === 0) return null

  const clinicEntity: Record<string, unknown> = {
    '@type': 'MedicalClinic',
    '@id': `${canonicalUrl}#clinic`,
    name: clinic.name,
    url: canonicalUrl,
  }

  applyGoogleReviewSchemaFields(clinicEntity, clinic, canonicalUrl)

  return {
    '@context': 'https://schema.org',
    '@graph': [clinicEntity],
  }
}

export function clinicHasGoogleReviewMarkup(clinic: ClinicDetail): boolean {
  const reviews = eligibleReviews(clinic.googleReviews)
  return clinic.googleRating != null || reviews.length > 0
}
