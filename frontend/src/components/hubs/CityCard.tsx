'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { getDictionary } from '@/lib/i18n'
import type { TreatmentTag } from '@/components/hubs/CountryCard'
import { clinicCityTreatmentPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'

export interface CityCardData {
  slug: string
  href: string
  clinicHref: string
  guideHref: string
  cityName: string
  cityKey: string
  countryKey: string
  countryName: string
  countryFlag: string
  countryHubHref: string
  countryGuideHref: string
  treatments: TreatmentTag[]
  hasPublishedGuide: boolean
}

function TreatmentTagBadge({
  tag,
  countryKey,
  cityKey,
  locale,
}: {
  tag: TreatmentTag
  countryKey: string
  cityKey: string
  locale: Locale
}) {
  const isActive = tag.status === 'active'
  const className = isActive
    ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-50)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-accent-700)] transition-colors hover:bg-[var(--color-accent-100)]'
    : 'inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-neutral-500)]'

  const content = (
    <>
      {tag.name}
      {!isActive && (
        <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">Soon</span>
      )}
    </>
  )

  if (isActive) {
    return (
      <Link
        href={clinicCityTreatmentPath(countryKey, cityKey, tag.id, locale)}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
}

export function CityCard({
  data,
  t,
  locale = 'en',
}: {
  data: CityCardData
  t: ReturnType<typeof getDictionary>
  locale?: Locale
}) {
  const activeTreatments = data.treatments.filter((tag) => tag.status === 'active')

  return (
    <Link
      href={data.href}
      className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary-200)] hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-xl leading-none"
            aria-hidden="true"
          >
            {data.countryFlag}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {data.cityName}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{data.countryName}</p>
          </div>
        </div>
        <ArrowRight
          size={16}
          className="mt-1 shrink-0 text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      {activeTreatments.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activeTreatments.slice(0, 3).map((tag) => (
            <TreatmentTagBadge
              key={tag.id}
              tag={tag}
              countryKey={data.countryKey}
              cityKey={data.cityKey}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-neutral-400)]">{t.hubs.cities.comingSoonLabel}</p>
      )}

      <p className="mt-auto pt-3 text-xs font-semibold text-[var(--color-accent-600)]">
        View city guide →
      </p>
    </Link>
  )
}
