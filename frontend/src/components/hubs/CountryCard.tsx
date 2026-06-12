'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { getDictionary } from '@/lib/i18n'
import type { CityDisplay } from '@/lib/content/hubs'
import { clinicCountryTreatmentPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { trackCardClick } from '@/lib/analytics'

export interface TreatmentTag {
  id: string
  name: string
  status: 'active' | 'coming_soon'
}

export interface CountryCardData {
  slug: string
  countryKey: string
  href: string
  guideHref: string
  name: string
  flag: string
  tagline: string
  cost: string
  clinics: string
  cities: CityDisplay[]
  treatments: TreatmentTag[]
  costNumeric: number
  clinicsNumeric: number
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium text-[var(--color-primary-700)]">
      {children}
    </span>
  )
}

function TreatmentTagBadge({
  tag,
  countryKey,
  linkTreatments,
  locale = 'en',
}: {
  tag: TreatmentTag
  countryKey: string
  linkTreatments?: boolean
  locale?: Locale
}) {
  const className =
    'inline-flex items-center rounded-full bg-[var(--color-accent-50)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent-700)] transition-colors hover:bg-[var(--color-accent-100)]'

  if (linkTreatments) {
    return (
      <Link
        href={clinicCountryTreatmentPath(countryKey, tag.id, locale)}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {tag.name}
      </Link>
    )
  }

  return <span className={className}>{tag.name}</span>
}

export function CountryCard({
  data,
  t: _t,
  linkTreatments = false,
  locale = 'en',
}: {
  data: CountryCardData
  t: ReturnType<typeof getDictionary>
  linkTreatments?: boolean
  locale?: Locale
}) {
  const activeTreatments = data.treatments.filter((tag) => tag.status === 'active')
  const metaParts = [data.cost, data.clinics].filter(Boolean)

  return (
    <article className="group rounded-xl border border-[var(--color-border)] bg-white px-4 py-3.5 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <Link
          href={data.href}
          onClick={() =>
            trackCardClick({ content_type: 'country', item_id: data.slug, item_name: data.name })
          }
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          <span className="text-2xl leading-none" role="img" aria-label={data.name}>
            {data.flag}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {data.name}
            </h2>
            {data.tagline && (
              <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">{data.tagline}</p>
            )}
          </div>
        </Link>

        {metaParts.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 pl-11 sm:pl-0">
            {metaParts.map((part, i) => (
              <span key={part} className="flex items-center gap-2">
                {i > 0 && (
                  <span className="text-[var(--color-neutral-300)]" aria-hidden="true">
                    ·
                  </span>
                )}
                <MetaPill>{part}</MetaPill>
              </span>
            ))}
          </div>
        )}
      </div>

      {(activeTreatments.length > 0 || data.cities.length > 0) && (
        <div className="mt-2.5 flex flex-col gap-1.5 pl-11">
          {activeTreatments.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeTreatments.map((tag) => (
                <TreatmentTagBadge
                  key={tag.id}
                  tag={tag}
                  countryKey={data.countryKey}
                  linkTreatments={linkTreatments}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {data.cities.length > 0 && (
            <p className="text-[11px] leading-relaxed text-[var(--color-neutral-500)]">
              {data.cities.map((city, i) => (
                <span key={city.cityKey}>
                  {i > 0 && (
                    <span className="mx-1 text-[var(--color-neutral-300)]" aria-hidden="true">
                      ·
                    </span>
                  )}
                  <Link
                    href={city.href}
                    className="text-[var(--color-neutral-600)] transition-colors hover:text-[var(--color-primary-800)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {city.cityName}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
