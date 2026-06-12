'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { PdpScrollRow, PdpScrollRowItem } from '@/components/shared/PdpScrollRow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatRelativeTime } from '@/lib/clinics/format'
import { en } from '@/lib/i18n/en'

type GoogleReviewsSectionProps = {
  clinic: ClinicDetail
}

const LONG_TEXT_THRESHOLD = 220

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
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
    <div className="mt-4 space-y-1.5 sm:mt-0 sm:min-w-[200px]">
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
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-200)]">
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
}: {
  review: NonNullable<ClinicDetail['googleReviews']>[number]
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const copy = en.clinicPdp.reviews
  const text = review.text ?? ''
  const isLong = text.length > LONG_TEXT_THRESHOLD
  const displayText = expanded || !isLong ? text : `${text.slice(0, LONG_TEXT_THRESHOLD).trim()}…`

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="font-semibold text-[var(--color-primary-900)]">
          {review.authorName ?? 'Anonymous'}
        </p>
        {review.rating != null && (
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <StarRating rating={review.rating} />
            <span className="text-[var(--color-neutral-600)]">{review.rating}</span>
          </div>
        )}
      </div>
      {text && (
        <>
          <p className="flex-1 text-sm leading-relaxed text-[var(--color-neutral-700)]">{displayText}</p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-left text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
            >
              {expanded ? copy.readLess : copy.readMore}
            </button>
          )}
        </>
      )}
      {review.time && (
        <p className="mt-3 text-xs text-[var(--color-neutral-500)]">
          {formatRelativeTime(review.time)}
        </p>
      )}
      <span className="sr-only">Review {index + 1}</span>
    </article>
  )
}

export function GoogleReviewsSection({ clinic }: GoogleReviewsSectionProps) {
  const reviews = clinic.googleReviews?.filter((r) => r.text || r.authorName) ?? []
  if (reviews.length === 0) return null

  const copy = en.clinicPdp.sections.reviews
  const rating = clinic.googleRating
  const reviewCount = clinic.googleReviewCount ?? reviews.length

  return (
    <section id="reviews" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} className="mb-6" />

      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-trust-50)]/60 to-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {rating != null && (
              <div className="flex items-baseline gap-2">
                <Star className="h-7 w-7 fill-[var(--color-trust-400)] text-[var(--color-trust-400)]" aria-hidden="true" />
                <span className="text-3xl font-bold tabular-nums text-[var(--color-primary-950)]">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
              {copy.aggregate
                .replace('{rating}', rating?.toFixed(1) ?? '—')
                .replace('{count}', String(reviewCount))}
            </p>
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

      <PdpScrollRow ariaLabel={copy.title} itemWidth="min(85vw, 320px)">
        {reviews.map((review, i) => (
          <PdpScrollRowItem key={`${review.authorName}-${review.time ?? i}`}>
            <ReviewCard review={review} index={i} />
          </PdpScrollRowItem>
        ))}
      </PdpScrollRow>
    </section>
  )
}
