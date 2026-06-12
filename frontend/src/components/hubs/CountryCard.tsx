'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { getDictionary } from '@/lib/i18n'
import type { CityDisplay } from '@/lib/content/hubs'
import { clinicCountryTreatmentPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { trackCardClick } from '@/lib/analytics'
import { TreatmentIconBadge } from '@/components/shared/TreatmentIconBadge'

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

function MetaBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--color-primary-50)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-800)]">
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
    'inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-50)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-accent-700)] transition-colors hover:bg-[var(--color-accent-100)]'

  const content = (
    <>
      <TreatmentIconBadge treatmentId={tag.id} size="xs" />
      {tag.name}
    </>
  )

  if (linkTreatments) {
    return (
      <Link
        href={clinicCountryTreatmentPath(countryKey, tag.id, locale)}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
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

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary-200)] hover:shadow-lg">
      <Link
        href={data.href}
        onClick={() =>
          trackCardClick({ content_type: 'country', item_id: data.slug, item_name: data.name })
        }
        className="flex items-start gap-3"
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-2xl leading-none"
          role="img"
          aria-label={data.name}
        >
          {data.flag}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
            {data.name}
          </h2>
          {data.tagline && (
            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--color-neutral-500)]">{data.tagline}</p>
          )}
        </div>
        <ArrowRight
          size={16}
          className="mt-1 shrink-0 text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>

      {(data.cost || data.clinics) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.cost && <MetaBadge>{data.cost}</MetaBadge>}
          {data.clinics && <MetaBadge>{data.clinics}</MetaBadge>}
        </div>
      )}

      {activeTreatments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.cities.map((city) => (
            <Link
              key={city.cityKey}
              href={city.href}
              className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
              onClick={(e) => e.stopPropagation()}
            >
              {city.cityName}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
