import { Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { formatRelativeTime } from '@/lib/clinics/format'

type GoogleReviewsSectionProps = {
  clinic: ClinicDetail
  showHeading?: boolean
}

export function GoogleReviewsSection({ clinic, showHeading = true }: GoogleReviewsSectionProps) {
  const reviews = clinic.googleReviews?.filter((r) => r.text || r.authorName) ?? []
  if (reviews.length === 0) return null

  return (
    <section>
      {showHeading && (
        <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">Google reviews</h2>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.slice(0, 6).map((review, i) => (
          <article
            key={`${review.authorName}-${i}`}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-[var(--color-primary-900)]">
                {review.authorName ?? 'Anonymous'}
              </p>
              {review.rating != null && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-[var(--color-trust-400)] text-[var(--color-trust-400)]" />
                  {review.rating}
                </div>
              )}
            </div>
            {review.text && (
              <p className="text-sm text-[var(--color-neutral-700)] leading-relaxed line-clamp-4">
                {review.text}
              </p>
            )}
            {review.time && (
              <p className="mt-2 text-xs text-[var(--color-neutral-500)]">
                {formatRelativeTime(review.time)}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
