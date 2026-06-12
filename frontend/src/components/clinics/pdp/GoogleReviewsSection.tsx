'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { PdpScrollRow, PdpScrollRowItem } from '@/components/shared/PdpScrollRow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  formatRelativeTime,
  formatReviewDate,
  reviewTimestampToIso,
} from '@/lib/clinics/format'
import { en } from '@/lib/i18n/en'

type GoogleReviewsSectionProps = {
  clinic: ClinicDetail
}

const LONG_TEXT_THRESHOLD = 220
const REVIEWS_HEADING_ID = 'google-reviews-heading'

function StarRating({ rating, label }: { rating: number; label?: string }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.round(rating)
              ? 'fill-[var(--color-trust-400)] text-[var(--color-trust-400)]'
              : 'fill-[var(--color-neutral-200)] text-[var(--color-neutral-200)]'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function RatingDistribution({ reviews }: { reviews: NonNullable<ClinicDetail['googleReviews']> }) {
  const copy = en.clinicPdp.reviews
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const review of reviews) {
      if (review.rating == null || review.rating < 1 || review.rating > 5) continue
      counts[Math.round(review.rating) - 1] += 1
    }
    const total = counts.reduce((sum, n) => sum + n, 0)
    return { counts, total }
  }, [reviews])

  if (distribution.total === 0) return null

  return (
    <div
      className="mt-4 space-y-1.5 sm:mt-0 sm:min-w-[200px]"
      aria-label="Rating distribution"
    >
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution.counts[stars - 1]
        const pct = Math.round((count / distribution.total) * 100)
        const label =
          stars === 1
            ? copy.stars.replace('{count}', String(stars))
            : copy.starsPlural.replace('{count}', String(stars))

        return (
          <div key={stars} className="flex items-center gap-2 text-xs text-[var(--color-neutral-600)]">
            <span className="w-12 shrink-0">{label}</span>
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-200)]"
              role="presentation"
            >
              <div
                className="h-full rounded-full bg-[var(--color-trust-400)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right tabular-nums">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ReviewCard({
  review,
  index,
  clinicName,
}: {
  review: NonNullable<ClinicDetail['googleReviews']>[number]
  index: number
  clinicName: string
}) {
  const [expanded, setExpanded] = useState(false)
  const copy = en.clinicPdp.reviews
  const sectionCopy = en.clinicPdp.sections.reviews
  const text = review.text ?? ''
  const isLong = text.length > LONG_TEXT_THRESHOLD
  const displayText = expanded || !isLong ? text : `${text.slice(0, LONG_TEXT_THRESHOLD).trim()}…`
  const isoDate = reviewTimestampToIso(review.time)
  const formattedDate = formatReviewDate(review.time)
  const relativeDate = formatRelativeTime(review.time)

  return (
    <article
      className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
      aria-labelledby={`review-author-${index}`}
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <p id={`review-author-${index}`} className="font-semibold text-[var(--color-primary-900)]">
          {review.authorName ?? 'Anonymous'}
        </p>
        {review.rating != null && (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <StarRating
              rating={review.rating}
              label={sectionCopy.ratingLabel.replace('{rating}', String(review.rating))}
            />
            <span className="text-[var(--color-neutral-600)]" aria-hidden="true">
              {review.rating}
            </span>
          </div>
        )}
      </header>

      {text && (
        <>
          <blockquote className="flex-1 border-l-2 border-[var(--color-trust-200)] pl-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">
            <p>&ldquo;{displayText}&rdquo;</p>
          </blockquote>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-left text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              aria-expanded={expanded}
            >
              {expanded ? copy.readLess : copy.readMore}
            </button>
          )}
        </>
      )}

      <footer className="mt-3 space-y-1 text-xs text-[var(--color-neutral-500)]">
        <p>{sectionCopy.sourcedFrom}</p>
        {formattedDate && isoDate && (
          <p>
            Review of {clinicName} on{' '}
            <time dateTime={isoDate}>{formattedDate}</time>
            {relativeDate ? ` · ${relativeDate}` : null}
          </p>
        )}
      </footer>
    </article>
  )
}

export function GoogleReviewsSection({ clinic }: GoogleReviewsSectionProps) {
  const reviews = clinic.googleReviews?.filter((r) => r.text || r.authorName) ?? []
  if (reviews.length === 0) return null

  const copy = en.clinicPdp.sections.reviews
  const rating = clinic.googleRating
  const reviewCount = clinic.googleReviewCount ?? reviews.length
  const aggregateSummary =
    rating != null
      ? copy.aggregate
          .replace('{rating}', rating.toFixed(1))
          .replace('{count}', String(reviewCount))
      : `${reviewCount} Google reviews`

  return (
    <section id="reviews" className="scroll-mt-28" aria-labelledby={REVIEWS_HEADING_ID}>
      <SectionHeading
        id={REVIEWS_HEADING_ID}
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.sourcedFrom}
        className="mb-6"
      />

      <div
        id="google-reviews-summary"
        data-speakable="true"
        className="mb-6 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)]/60 to-white p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {rating != null && (
              <div className="flex items-baseline gap-2">
                <Star
                  className="h-7 w-7 fill-[var(--color-trust-400)] text-[var(--color-trust-400)]"
                  aria-hidden="true"
                />
                <span
                  className="text-3xl font-bold tabular-nums text-[var(--color-primary-950)]"
                  aria-label={copy.ratingLabel.replace('{rating}', rating.toFixed(1))}
                >
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{aggregateSummary}</p>
            <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{copy.sourcedFrom}</p>
            {clinic.googleMapsUrl && (
              <Link
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                {copy.viewOnGoogle}
              </Link>
            )}
          </div>
          <RatingDistribution reviews={reviews} />
        </div>
      </div>

      <PdpScrollRow ariaLabel={`${copy.title} — ${reviews.length} shown`} itemWidth="min(85vw, 320px)">
        {reviews.map((review, i) => (
          <PdpScrollRowItem key={`${review.authorName}-${review.time ?? i}`}>
            <ReviewCard review={review} index={i} clinicName={clinic.name} />
          </PdpScrollRowItem>
        ))}
      </PdpScrollRow>

      {reviewCount > reviews.length && (
        <p className="mt-4 text-sm text-[var(--color-neutral-500)]">
          Showing {reviews.length} of {reviewCount} Google reviews
          {clinic.googleMapsUrl ? (
            <>
              {' '}
              ·{' '}
              <Link
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                {copy.viewOnGoogle}
              </Link>
            </>
          ) : null}
        </p>
      )}
    </section>
  )
}
