import type { ReactNode } from 'react'
import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import {
  getFeaturedCountries,
  getCountryDisplay,
  getCountryKeyFromSlug,
  getCitiesForCountry,
  partitionGuides,
  type CityDisplay,
} from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'

interface CountryCardData {
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

function parseCostNumeric(cost: string): number {
  const n = parseInt(cost.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 99999 : n
}

function parseClinicsNumeric(clinics: string): number {
  const n = parseInt(clinics.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 0 : n
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)] border border-[var(--color-primary-100)]">
      {children}
    </span>
  )
}

function CountryCard({ data, t }: { data: CountryCardData; t: ReturnType<typeof getDictionary> }) {
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

export interface CountriesListProps {
  locale: Locale
  treatment?: string
  sort?: string
}

export async function CountriesList({ locale, treatment, sort }: CountriesListProps) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const { countries: countryPages, cities: cityPages } = partitionGuides(pages, locale)

  const activeTreatment = treatmentCategories.find((c) => c.status === 'active')
  const treatmentName = activeTreatment?.name ?? 'IVF & Fertility'

  const baseCountries =
    countryPages.length > 0
      ? countryPages.map((p) => getCountryDisplay(p.slug.replace(/^\//, ''), locale))
      : getFeaturedCountries(locale)

  if (baseCountries.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.countries.empty}</p>
  }

  let cards: CountryCardData[] = baseCountries.map((display) => {
    const countryKey = getCountryKeyFromSlug(display.slug) ?? ''
    return {
      slug: display.slug,
      href: display.href,
      guideHref: display.guideHref,
      name: display.name,
      flag: display.flag,
      tagline: display.tagline,
      cost: display.cost,
      clinics: display.clinics,
      cities: getCitiesForCountry(countryKey, cityPages, locale),
      treatmentName,
      costNumeric: parseCostNumeric(display.cost),
      clinicsNumeric: parseClinicsNumeric(display.clinics),
    }
  })

  // Filter by treatment — future-proofing; currently only IVF is active
  if (treatment && treatment !== activeTreatment?.id) {
    cards = []
  }

  // Sort
  if (sort === 'cost-asc') {
    cards = [...cards].sort((a, b) => a.costNumeric - b.costNumeric)
  } else if (sort === 'cost-desc') {
    cards = [...cards].sort((a, b) => b.costNumeric - a.costNumeric)
  } else if (sort === 'alpha') {
    cards = [...cards].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'clinics') {
    cards = [...cards].sort((a, b) => b.clinicsNumeric - a.clinicsNumeric)
  }

  if (cards.length === 0) {
    return (
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        No countries found for the selected filter.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <CountryCard key={card.slug} data={card} t={t} />
      ))}
    </div>
  )
}

export function CountriesListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
      ))}
    </div>
  )
}
