'use client'

import Link from 'next/link'
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
    ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent-700)] transition-colors hover:bg-[var(--color-accent-100)]'
    : 'inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-neutral-500)]'

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
  return (
    <Link
      href={data.href}
      className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
            {data.cityName}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--color-neutral-500)]">
            <span aria-hidden="true">{data.countryFlag}</span>
            {data.countryName}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-[var(--color-accent-600)]">→</span>
      </div>

      {data.treatments.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {data.treatments
            .filter((tag) => tag.status === 'active')
            .slice(0, 2)
            .map((tag) => (
              <TreatmentTagBadge
                key={tag.id}
                tag={tag}
                countryKey={data.countryKey}
                cityKey={data.cityKey}
                locale={locale}
              />
            ))}
          {data.treatments.filter((tx) => tx.status === 'active').length === 0 && (
            <span className="text-xs text-[var(--color-neutral-400)]">{t.hubs.cities.comingSoonLabel}</span>
          )}
        </div>
      )}
    </Link>
  )
}
