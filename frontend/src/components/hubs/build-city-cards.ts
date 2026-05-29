import type { ContentListItem } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  parseCitySlug,
  partitionGuides,
  countryMeta,
  staticCitiesPerCountry,
  getCountryLandingPath,
  getCityHubPath,
  getCountryGuideHref,
  slugToLabel,
} from '@/lib/content/hubs'
import { getTreatmentTagsForCountry } from '@/lib/content/country-treatments'
import type { CityCardData } from '@/components/hubs/CityCard'

export function buildCityCards(pages: ContentListItem[], locale: Locale): CityCardData[] {
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

  for (const [countryKey, cityKeys] of Object.entries(staticCitiesPerCountry)) {
    const countrySlug = `guides/${countryKey}-ivf-guide`
    const meta = countryMeta[countrySlug]
    if (!meta) continue

    const treatments = getTreatmentTagsForCountry(countryKey)

    for (const cityKey of cityKeys) {
      const guideSlug = `guides/${countryKey}/${cityKey}-ivf-guide`
      cards.push({
        slug: guideSlug,
        href: getCityHubPath(countryKey, cityKey, locale),
        guideHref: localizedPath(`/${guideSlug}`, locale),
        cityName: slugToLabel(cityKey),
        cityKey,
        countryKey,
        countryName: meta.name,
        countryFlag: meta.flag,
        countryHubHref: getCountryLandingPath(countryKey, locale),
        countryGuideHref: getCountryGuideHref(countryKey, locale),
        treatments,
        hasPublishedGuide: publishedByKey.has(`${countryKey}/${cityKey}`),
      })
    }
  }

  return cards
}

export type { CityCardData }
