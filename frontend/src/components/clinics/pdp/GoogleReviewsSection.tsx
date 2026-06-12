'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatRelativeTime } from '@/lib/clinics/format'
import { en } from '@/lib/i18n/en'

type GoogleReviewsSectionProps = {
  clinic: ClinicDetail
}

const INITIAL_VISIBLE = 4

export function GoogleReviewsSection({ clinic }: GoogleReviewsSectionProps) {
  const reviews = clinic.googleReviews?.filter((r) => r.text || r.authorName) ?? []
  const [expanded, setExpanded] = useState(false)

  if (reviews.length === 0) return null

  const copy = en.clinicPdp.sections.reviews
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE)
  const hasMore = reviews.length > INITIAL_VISIBLE

  return (
    <section id="reviews" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} className="mb-6" />
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((review, i) => (
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
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
        >
          {expanded
            ? en.clinicPdp.reviews.showLess
            : en.clinicPdp.reviews.showAll.replace('{count}', String(reviews.length))}
        </button>
      )}
    </section>
  )
}
