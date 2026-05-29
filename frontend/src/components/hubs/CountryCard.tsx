import type { ReactNode } from 'react'
import Link from 'next/link'
import type { getDictionary } from '@/lib/i18n'
import type { CityDisplay } from '@/lib/content/hubs'

export interface CountryCardData {
  slug: string
  href: string
  guideHref: string
  name: string
  flag: string
  tagline: string
  cost: string
  clinics: string
  cities: CityDisplay[]
  treatmentName: string
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

export function CountryCard({
  data,
  t,
}: {
  data: CountryCardData
  t: ReturnType<typeof getDictionary>
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white transition-colors hover:border-[var(--color-primary-200)]">
      <Link href={data.href} className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 px-4 py-4">
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
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {data.cost && <Pill>{data.cost}</Pill>}
            {data.clinics && <Pill>{data.clinics}</Pill>}
          </div>
        )}

        {data.cities.length > 0 && (
          <p className="px-4 pb-3 text-xs text-[var(--color-neutral-500)]">
            {data.cities.map((c) => c.cityName).join(' · ')}
          </p>
        )}
      </Link>

      <div className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-2.5 text-xs">
        <Link
          href={data.guideHref}
          className="font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
        >
          {t.hubs.guidePosts.readGuide} →
        </Link>
        <span className="text-[var(--color-neutral-300)]" aria-hidden="true">
          ·
        </span>
        <Link
          href={data.href}
          className="text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]"
        >
          {t.hubs.countries.exploreCountry.replace('{country}', data.name)}
        </Link>
      </div>
    </article>
  )
}
