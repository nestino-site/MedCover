'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { cn } from '@/lib/utils/cn'

type ClinicPdpHeaderProps = {
  clinic: ClinicDetail
  locationLabel: string
}

export function ClinicPdpHeader({ clinic, locationLabel }: ClinicPdpHeaderProps) {
  const gallery = clinic.media?.length
    ? clinic.media.filter((m) => m.kind !== 'LOGO')
    : clinic.photoUrl
      ? [{ url: clinic.photoUrl, isPrimary: true, kind: 'PHOTO' as const }]
      : []

  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, gallery.findIndex((m) => m.isPrimary)),
  )
  const activeImage = gallery[activeIndex] ?? gallery[0]

  return (
    <header className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-4xl font-bold text-[var(--color-primary-950)]">{clinic.name}</h1>
          {clinic.truthScore?.composite != null && (
            <TruthScoreBadge
              composite={clinic.truthScore.composite}
              grade={clinic.truthScore.grade}
            />
          )}
        </div>

        <p className="text-lg text-[var(--color-neutral-600)]">{locationLabel}</p>

        {clinic.googleRating != null && (
          <div className="flex items-center gap-2 text-[var(--color-neutral-700)]">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold">{clinic.googleRating.toFixed(1)}</span>
            {clinic.googleReviewCount != null && (
              <span className="text-[var(--color-neutral-500)]">
                ({clinic.googleReviewCount} Google reviews)
              </span>
            )}
          </div>
        )}

        {clinic.accreditations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clinic.accreditations.map((acc) => (
              <span
                key={acc.code}
                className="rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-3 py-1 text-xs font-medium text-[var(--color-accent-900)]"
              >
                {acc.name}
              </span>
            ))}
          </div>
        )}

        {clinic.editorialSummary && (
          <p className="text-[var(--color-neutral-700)] leading-relaxed">{clinic.editorialSummary}</p>
        )}
      </div>

      {activeImage && (
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--color-neutral-100)]">
            <Image
              src={activeImage.url}
              alt={activeImage.caption ?? clinic.name}
              fill
              className="object-cover"
              priority
              sizes="380px"
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
                    'relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    i === activeIndex
                      ? 'border-[var(--color-primary-600)]'
                      : 'border-transparent opacity-70 hover:opacity-100',
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
