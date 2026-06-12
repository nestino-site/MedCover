'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BreadcrumbItem, ClinicDetail } from '@/lib/api/types'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { EntityHero, type EntityHeroStat } from '@/components/shared/EntityHero'
import { cn } from '@/lib/utils/cn'
import { formatPriceRange } from '@/lib/clinics/format'
import { en } from '@/lib/i18n/en'

type ClinicPdpHeroProps = {
  clinic: ClinicDetail
  breadcrumbs: BreadcrumbItem[]
  locationLabel: string
  answer?: string
  lastUpdated?: string | null
  overviewLinks?: {
    city?: { href: string; label: string }
    country?: { href: string; label: string }
  }
}

function ClinicGallery({ clinic }: { clinic: ClinicDetail }) {
  const gallery = clinic.media?.length
    ? clinic.media.filter((m) => m.kind !== 'LOGO')
    : clinic.photoUrl
      ? [{ url: clinic.photoUrl, isPrimary: true, kind: 'PHOTO' as const, caption: null }]
      : []

  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, gallery.findIndex((m) => m.isPrimary)),
  )
  const activeImage = gallery[activeIndex] ?? gallery[0]

  if (!activeImage) return null

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--color-neutral-100)] shadow-[var(--shadow-card)]">
        <Image
          src={activeImage.url}
          alt={activeImage.caption ?? `${clinic.name} clinic photo`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 380px"
        />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-11 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex
                  ? 'border-[var(--color-primary-600)]'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image
                src={img.url}
                alt={img.caption ?? `${clinic.name} photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ClinicPdpHero({
  clinic,
  breadcrumbs,
  locationLabel,
  answer,
  lastUpdated,
  overviewLinks,
}: ClinicPdpHeroProps) {
  const stats: EntityHeroStat[] = []

  if (clinic.googleRating != null) {
    stats.push({
      label: 'Google rating',
      value:
        clinic.googleReviewCount != null
          ? `${clinic.googleRating.toFixed(1)} (${clinic.googleReviewCount})`
          : clinic.googleRating.toFixed(1),
    })
  }

  if (clinic.treatments.length > 0) {
    stats.push({
      label: 'Treatments',
      value: String(clinic.treatments.length),
      href: '#treatments',
    })
  }

  if (clinic.priceRange) {
    stats.push({
      label: 'Price range',
      value: formatPriceRange(
        clinic.priceRange.min,
        clinic.priceRange.max,
        clinic.priceRange.currency,
      ),
      href: '#pricing',
    })
  }

  const formattedUpdated =
    lastUpdated &&
    !Number.isNaN(new Date(lastUpdated).getTime()) &&
    new Date(lastUpdated).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <EntityHero
          hideBreadcrumb
          breadcrumbs={breadcrumbs}
          eyebrow={locationLabel}
          title={clinic.name}
          description={answer ? undefined : clinic.editorialSummary ?? undefined}
          answer={answer}
          answerLabel={en.clinicPdp.speakableSummaryLabel}
          stats={stats.length > 0 ? stats : undefined}
          className="mb-0"
        >
          <div className="flex flex-wrap items-center gap-3">
            {clinic.accreditations.map((acc) => (
              <span
                key={acc.code}
                className="rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-3 py-1 text-xs font-medium text-[var(--color-accent-900)]"
              >
                {acc.name}
              </span>
            ))}
          </div>
        </EntityHero>

        <ClinicGallery clinic={clinic} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {overviewLinks?.city && (
          <Link
            href={overviewLinks.city.href}
            className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {overviewLinks.city.label}
          </Link>
        )}
        {overviewLinks?.country && (
          <Link
            href={overviewLinks.country.href}
            className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
          >
            {overviewLinks.country.label}
          </Link>
        )}
        {formattedUpdated && (
          <p className="text-[var(--color-neutral-500)]">
            {en.clinicPdp.lastUpdated} {formattedUpdated}
          </p>
        )}
      </div>
    </div>
  )
}
