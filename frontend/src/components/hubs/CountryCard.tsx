import type { ReactNode } from 'react'
import Link from 'next/link'
import type { getDictionary } from '@/lib/i18n'
import type { CityDisplay } from '@/lib/content/hubs'

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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
      {children}
    </span>
  )
}

function TreatmentTagBadge({ tag }: { tag: TreatmentTag }) {
  const isActive = tag.status === 'active'
  return (
    <span
      className={
        isActive
          ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-700)]'
          : 'inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-neutral-500)]'
      }
    >
      {tag.name}
      {!isActive && (
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">Soon</span>
      )}
    </span>
  )
}

export function CountryCard({
  data,
  t,
}: {
  data: CountryCardData
  t: ReturnType<typeof getDictionary>
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition-colors hover:border-[var(--color-primary-200)]">
      <Link href={data.href} className="flex flex-col px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" role="img" aria-label={data.name}>
            {data.flag}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
              {data.name}
            </h2>
            <p className="text-sm text-[var(--color-neutral-500)]">{data.tagline}</p>
          </div>
        </div>

        {(data.cost || data.clinics) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.cost && <Pill>{data.cost}</Pill>}
            {data.clinics && <Pill>{data.clinics}</Pill>}
          </div>
        )}
      </Link>

      {data.treatments.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
            {t.hubs.countries.treatmentsLabel}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.treatments.map((tag) => (
              <TreatmentTagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      )}

      {data.cities.length > 0 && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
            {t.hubs.countries.citiesLabel}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.cities.map((city) => (
              <Link
                key={city.cityKey}
                href={city.href}
                className="rounded-md bg-[var(--color-surface-subtle)] px-2 py-0.5 text-xs text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
              >
                {city.cityName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
