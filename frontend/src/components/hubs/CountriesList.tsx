import { Suspense } from 'react'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import {
  getFeaturedCountries,
  getCountryDisplay,
  getCountryKeyFromSlug,
  getCitiesForCountry,
  partitionGuides,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/country-treatments'
import type { CountryCardData } from '@/components/hubs/CountryCard'
import { CountriesListView } from '@/components/hubs/CountriesListView'

export type { CountryCardData } from '@/components/hubs/CountryCard'
export { CountryCard } from '@/components/hubs/CountryCard'

function parseCostNumeric(cost: string): number {
  const n = parseInt(cost.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 99999 : n
}

function parseClinicsNumeric(clinics: string): number {
  const n = parseInt(clinics.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 0 : n
}

export interface CountriesListProps {
  locale: Locale
}

export async function CountriesList({ locale }: CountriesListProps) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const { countries: countryPages, cities: cityPages } = partitionGuides(pages, locale)

  const baseCountries =
    countryPages.length > 0
      ? countryPages.map((p) => getCountryDisplay(p.slug.replace(/^\//, ''), locale))
      : getFeaturedCountries(locale)

  if (baseCountries.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.countries.empty}</p>
  }

  const cards: CountryCardData[] = baseCountries.map((display) => {
    const countryKey = getCountryKeyFromSlug(display.slug) ?? ''
    return {
      slug: display.slug,
      countryKey,
      href: display.href,
      guideHref: display.guideHref,
      name: display.name,
      flag: display.flag,
      tagline: display.tagline,
      cost: display.cost,
      clinics: display.clinics,
      cities: getCitiesForCountry(countryKey, cityPages, locale),
      treatments: getTreatmentTagsForCountry(countryKey),
      costNumeric: parseCostNumeric(display.cost),
      clinicsNumeric: parseClinicsNumeric(display.clinics),
    }
  })

  if (cards.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.countries.empty}</p>
  }

  return (
    <Suspense fallback={<CountriesListSkeleton />}>
      <CountriesListView cards={cards} locale={locale} />
    </Suspense>
  )
}

export function CountriesListSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading countries"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
          <div className="h-20 animate-pulse bg-[var(--color-neutral-100)]" />
          <div className="space-y-2 px-4 py-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-neutral-100)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-neutral-100)]" />
            <div className="mt-4 h-8 animate-pulse rounded bg-[var(--color-neutral-100)]" />
          </div>
        </div>
      ))}
    </div>
  )
}
