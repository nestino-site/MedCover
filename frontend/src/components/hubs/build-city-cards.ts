import type { ContentListItem, Taxonomy } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  parseCitySlug,
  partitionGuides,
  getCountryLandingPath,
  getCityHubPath,
  getCountryGuideHref,
  getCountryDisplayFromTaxonomy,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/treatments'
import type { CityCardData } from '@/components/hubs/CityCard'

export function buildCityCards(
  pages: ContentListItem[],
  locale: Locale,
  taxonomy: Taxonomy,
): CityCardData[] {
  const { cities: cityPages } = partitionGuides(pages, locale)
  const publishedByKey = new Map<string, ContentListItem>()

  for (const page of cityPages) {
    const slug = page.slug.replace(/^\//, '')
    const info = parseCitySlug(slug)
    if (!info) continue
    const cityKey = slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
    publishedByKey.set(`${info.countryKey}/${cityKey}`, page)
  }

  const cards: CityCardData[] = []

  for (const country of taxonomy.countries) {
    const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
    const treatments = getTreatmentTagsForCountry(taxonomy, country.slug)

    for (const city of country.cities) {
      const guideSlug = `guides/${country.slug}/${city.slug}-ivf-guide`
      cards.push({
        slug: guideSlug,
        href: getCityHubPath(country.slug, city.slug, locale),
        guideHref: localizedPath(`/${guideSlug}`, locale),
        cityName: city.name,
        cityKey: city.slug,
        countryKey: country.slug,
        countryName: display.name,
        countryFlag: display.flag,
        countryHubHref: getCountryLandingPath(country.slug, locale),
        countryGuideHref: getCountryGuideHref(country.slug, locale),
        treatments,
        hasPublishedGuide: publishedByKey.has(`${country.slug}/${city.slug}`),
      })
    }
  }

  return cards
}

export type { CityCardData }
