'use client'

import Link from 'next/link'
import { RemoteImage } from '@/components/shared/RemoteImage'
import type { ClinicCard as ClinicCardType } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'
import { Star } from 'lucide-react'
import { trackCardClick } from '@/lib/analytics'

type ClinicCardProps = {
  clinic: ClinicCardType
  className?: string
  priority?: boolean
}

function formatPrice(min?: number, max?: number, currency?: string): string | null {
  if (min == null || max == null) return null
  const sym = currency === 'EUR' ? '€' : currency ?? ''
  return `${sym}${min.toLocaleString()}–${sym}${max.toLocaleString()}`
}

export function ClinicCard({ clinic, className, priority }: ClinicCardProps) {
  const href = clinic.urlPath.endsWith('/') ? clinic.urlPath : `${clinic.urlPath}/`
  const price = clinic.priceRange
    ? formatPrice(clinic.priceRange.min, clinic.priceRange.max, clinic.priceRange.currency)
    : null

  return (
    <Card as="article" interactive className={cn('flex flex-col', className)}>
      <Link href={href} className="relative aspect-[16/10] overflow-hidden bg-[var(--color-neutral-100)]" onClick={() => trackCardClick({ content_type: 'clinic', item_id: clinic.urlPath, item_name: clinic.name })}>
        {clinic.photoUrl ? (
          <RemoteImage
            src={clinic.photoUrl}
            alt={clinic.name}
            fill
            className="object-cover transition-transform group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-neutral-400)]">
            Clinic photo
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link href={href}>
            <h3 className="text-lg font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {clinic.name}
            </h3>
          </Link>
          {clinic.truthScore?.composite != null && (
            <TruthScoreBadge
              composite={clinic.truthScore.composite}
              grade={clinic.truthScore.grade}
            />
          )}
        </div>

        {(clinic.city || clinic.country) && (
          <p className="text-sm text-[var(--color-neutral-500)]">
            {[clinic.city?.name, clinic.country?.name].filter(Boolean).join(', ')}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-neutral-700)]">
          {clinic.googleRating != null && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-[var(--color-trust-400)] text-[var(--color-trust-400)]" aria-hidden />
              <span className="font-medium">{clinic.googleRating.toFixed(1)}</span>
              {clinic.googleReviewCount != null && (
                <span className="text-[var(--color-neutral-500)]">
                  ({clinic.googleReviewCount} reviews)
                </span>
              )}
            </div>
          )}
          {clinic.interviewCount != null && clinic.interviewCount > 0 && (
            <span className="text-[var(--color-trust-700)]">
              {clinic.interviewCount} verified interview{clinic.interviewCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {clinic.treatments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clinic.treatments.slice(0, 3).map((t) => (
              <span
                key={t.slug}
                className="rounded-md bg-[var(--color-primary-50)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-800)]"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {price && (
          <p className="text-sm font-medium text-[var(--color-primary-900)]">{price}</p>
        )}

        {clinic.editorialSummary && (
          <p className="line-clamp-2 text-sm text-[var(--color-neutral-600)]">
            {clinic.editorialSummary}
          </p>
        )}

        <Link
          href={href}
          className="mt-auto text-sm font-semibold text-[var(--color-primary-700)] hover:underline"
        >
          View profile →
        </Link>
      </div>
    </Card>
  )
}
