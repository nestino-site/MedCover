import type { ContentListItem } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  parseCitySlug,
  partitionGuides,
  countryMeta,
  getCountryLandingPath,
  getCityHubPath,
  getCountryGuideHref,
} from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'
import type { CityCardData } from '@/components/hubs/CitiesListView'

export function buildCityCards(pages: ContentListItem[], locale: Locale): CityCardData[] {
  const { cities: cityPages } = partitionGuides(pages, locale)
  const activeTreatment = treatmentCategories.find((c) => c.status === 'active')
  const treatmentName = activeTreatment?.name ?? 'IVF & Fertility'

  return cityPages
    .map((page) => {
      const slug = page.slug.replace(/^\//, '')
      const info = parseCitySlug(slug)
      if (!info) return null
      const countrySlug = `guides/${info.countryKey}-ivf-guide`
      const meta = countryMeta[countrySlug]
      const cityKey = slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
      return {
        slug,
        href: getCityHubPath(info.countryKey, cityKey, locale),
        guideHref: localizedPath(`/${slug}`, locale),
        cityName: info.cityName,
        countryKey: info.countryKey,
        countryName: info.countryName,
        countryFlag: meta?.flag ?? '🌍',
        countryHubHref: getCountryLandingPath(info.countryKey, locale),
        countryGuideHref: getCountryGuideHref(info.countryKey, locale),
        treatmentName,
      }
    })
    .filter((c): c is CityCardData => c !== null)
}
