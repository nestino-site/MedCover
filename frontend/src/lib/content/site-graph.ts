import type { ContentListItem } from '@/lib/api/types'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { hubPath } from './site-nav'
import { countryMeta, parseCitySlug, slugToLabel } from './hubs'
import type { HubId } from './site-nav'
import { appendFiltersToUrl, buildContextualHubUrl, type ActiveFilters } from './filter-utils'

export type GuideLevel = 'country' | 'city'

export interface GuideDimensions {
  treatment: 'ivf'
  countryKey: string
  countryName: string
  cityKey?: string
  cityName?: string
  level: GuideLevel
  slug: string
}

export interface HubLink {
  label: string
  href: string
  hubId?: HubId
}

export function parseGuideSlug(slug: string): GuideDimensions | null {
  const countryMatch = slug.match(/^guides\/([^/]+)-ivf-guide$/)
  if (countryMatch) {
    const countryKey = countryMatch[1]
    const fullSlug = `guides/${countryKey}-ivf-guide`
    const countryName = countryMeta[fullSlug]?.name ?? slugToLabel(countryKey)
    return {
      treatment: 'ivf',
      countryKey,
      countryName,
      level: 'country',
      slug,
    }
  }

  const cityParsed = parseCitySlug(slug)
  if (cityParsed) {
    return {
      treatment: 'ivf',
      countryKey: cityParsed.countryKey,
      countryName: cityParsed.countryName,
      cityKey: slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1],
      cityName: cityParsed.cityName,
      level: 'city',
      slug,
    }
  }

  return null
}

export function filterPagesByLocale(pages: ContentListItem[], locale: Locale): ContentListItem[] {
  return pages.filter((p) => {
    const lang = (p.language || 'en').toLowerCase().split('-')[0]
    return lang === locale
  })
}

export function getHubLinksForGuide(
  dim: GuideDimensions,
  locale: Locale,
  fromFilters?: ActiveFilters,
): HubLink[] {
  const t = getDictionary(locale)
  const countryLandingHref = localizedPath(`/countries/${dim.countryKey}`, locale)

  const ff = fromFilters ?? {}

  const links: HubLink[] = [
    { label: t.crossHub.allCountries, href: buildContextualHubUrl('countries', ff, locale), hubId: 'countries' },
    { label: t.crossHub.allCities, href: buildContextualHubUrl('cities', ff, locale), hubId: 'cities' },
    { label: t.crossHub.ivfTreatments, href: hubPath('treatments', locale), hubId: 'treatments' },
    { label: t.crossHub.allGuides, href: buildContextualHubUrl('guides', ff, locale), hubId: 'guides' },
  ]

  if (dim.level === 'country') {
    // Link to country-specific cities sub-page
    links.splice(1, 0, {
      label: `${t.crossHub.citiesIn} ${dim.countryName}`,
      href: localizedPath(`/countries/${dim.countryKey}/cities`, locale),
      hubId: 'cities',
    })
    links.unshift({
      label: `${dim.countryName} ${t.crossHub.countryOverview}`,
      href: countryLandingHref,
    })
  }

  if (dim.level === 'city' && dim.cityName) {
    links.unshift({
      label: `${dim.countryName} ${t.crossHub.countryOverview}`,
      href: countryLandingHref,
    })
  }

  return links
}

export function getHubLinksForHubPage(
  hubId: HubId,
  locale: Locale,
  fromFilters?: ActiveFilters,
): HubLink[] {
  const t = getDictionary(locale)
  const ff = fromFilters ?? {}
  const links: HubLink[] = []

  switch (hubId) {
    case 'countries':
      links.push(
        { label: t.crossHub.allCities, href: buildContextualHubUrl('cities', ff, locale), hubId: 'cities' },
        { label: t.crossHub.ivfTreatments, href: hubPath('treatments', locale), hubId: 'treatments' },
        { label: t.crossHub.allGuides, href: buildContextualHubUrl('guides', ff, locale), hubId: 'guides' },
      )
      break
    case 'cities':
      links.push(
        { label: t.crossHub.allCountries, href: buildContextualHubUrl('countries', ff, locale), hubId: 'countries' },
        { label: t.crossHub.ivfTreatments, href: hubPath('treatments', locale), hubId: 'treatments' },
        { label: t.crossHub.allGuides, href: buildContextualHubUrl('guides', ff, locale), hubId: 'guides' },
      )
      break
    case 'treatments':
      links.push(
        { label: t.crossHub.allCountries, href: buildContextualHubUrl('countries', ff, locale), hubId: 'countries' },
        { label: t.crossHub.allCities, href: buildContextualHubUrl('cities', ff, locale), hubId: 'cities' },
        { label: t.crossHub.allGuides, href: buildContextualHubUrl('guides', ff, locale), hubId: 'guides' },
      )
      break
    case 'guides':
      links.push(
        { label: t.crossHub.allCountries, href: buildContextualHubUrl('countries', ff, locale), hubId: 'countries' },
        { label: t.crossHub.allCities, href: buildContextualHubUrl('cities', ff, locale), hubId: 'cities' },
        { label: t.crossHub.ivfTreatments, href: hubPath('treatments', locale), hubId: 'treatments' },
      )
      break
    case 'costs':
      links.push(
        { label: t.crossHub.allCountries, href: buildContextualHubUrl('countries', ff, locale), hubId: 'countries' },
        { label: t.crossHub.allCities, href: buildContextualHubUrl('cities', ff, locale), hubId: 'cities' },
        { label: t.crossHub.ivfTreatments, href: hubPath('treatments', locale), hubId: 'treatments' },
      )
      break
    default:
      break
  }

  return links
}

export function getComingSoonHelpLinks(locale: Locale): HubLink[] {
  const t = getDictionary(locale)
  return [
    { label: t.nav.countries, href: hubPath('countries', locale), hubId: 'countries' },
    { label: t.nav.cities, href: hubPath('cities', locale), hubId: 'cities' },
    { label: t.nav.treatments, href: hubPath('treatments', locale), hubId: 'treatments' },
    { label: t.nav.guides, href: hubPath('guides', locale), hubId: 'guides' },
  ]
}
