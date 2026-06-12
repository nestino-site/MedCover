import { Suspense } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import type { ContentListItem, Taxonomy } from '@/lib/api/types'
import {
  getFeaturedCountriesFromTaxonomy,
  getCountryDisplayFromTaxonomy,
  getCountryKeyFromSlug,
  getCitiesForCountry,
  partitionGuides,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/treatments'
import type { CountryCardData } from '@/components/hubs/CountryCard'
import { CountriesListView } from '@/components/hubs/CountriesListView'
import { CardGridSkeleton, CountryCardSkeleton } from '@/components/ui/skeletons'
import { SkeletonStatus } from '@/components/ui/Skeleton'

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
  taxonomy: Taxonomy
  pages: ContentListItem[]
}

export function CountriesList({ locale, taxonomy, pages }: CountriesListProps) {
  const t = getDictionary(locale)
  const { countries: countryPages, cities: cityPages } = partitionGuides(pages, locale, taxonomy)

  const baseCountries =
    countryPages.length > 0
      ? countryPages.map((p) => {
          const countryKey = getCountryKeyFromSlug(p.slug.replace(/^\//, '')) ?? ''
          return getCountryDisplayFromTaxonomy(countryKey, taxonomy, locale)
        })
      : getFeaturedCountriesFromTaxonomy(taxonomy, locale)

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
      cities: getCitiesForCountry(countryKey, cityPages, locale, taxonomy),
      treatments: getTreatmentTagsForCountry(taxonomy, countryKey),
      costNumeric: parseCostNumeric(display.cost),
      clinicsNumeric: parseClinicsNumeric(display.clinics),
    }
  })

  if (cards.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.countries.empty}</p>
  }

  return (
    <Suspense fallback={<CountriesListSkeleton />}>
      <CountriesListView cards={cards} locale={locale} taxonomy={taxonomy} />
    </Suspense>
  )
}

export function CountriesListSkeleton() {
  return (
    <SkeletonStatus label="Loading countries">
      <CardGridSkeleton count={6} gridClassName="grid grid-cols-1 gap-3">
        <CountryCardSkeleton />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}
