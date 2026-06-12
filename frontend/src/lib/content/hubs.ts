import type { ContentListItem } from '@/lib/api/types'
import type { Taxonomy } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import { filterPagesByLocale } from './site-graph'
import {
  clinicCityPath,
  clinicCountryPath,
  clinicPdpPath,
  countryLandingPath,
  guidePath,
  slugToLabel,
} from '@/lib/routes'

export interface CityDisplay {
  cityKey: string
  cityName: string
  citySlug: string
  href: string
  guideHref: string
}

export interface RelatedArticleItem {
  title: string
  href: string
}

const COUNTRY_SLUG_RE = /^guides\/[^/]+-ivf-guide$/
const CITY_SLUG_RE = /^guides\/([^/]+)\/.+-ivf-guide$|^guides\/[^/]+\/[^/]+$/

export function isCountryGuideSlug(slug: string): boolean {
  return COUNTRY_SLUG_RE.test(slug.replace(/^\//, ''))
}

export function isCityGuideSlug(slug: string): boolean {
  const normalized = slug.replace(/^\//, '')
  return CITY_SLUG_RE.test(normalized) && !isCountryGuideSlug(normalized)
}

export function filterPagesByHub(
  pages: ContentListItem[],
  hubSegment: string,
  locale?: Locale,
): ContentListItem[] {
  const filtered = locale ? filterPagesByLocale(pages, locale) : pages
  const prefix = hubSegment.replace(/^\//, '').replace(/\/$/, '')

  return filtered
    .filter((page) => {
      const slug = page.slug.replace(/^\//, '')
      return slug.startsWith(`${prefix}/`) && slug.length > prefix.length + 1
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
}

export function pageTitleFromSlug(slug: string): string {
  const normalized = slug.replace(/^\//, '')
  const last = normalized.split('/').pop() ?? normalized
  return slugToLabel(last.replace(/-ivf-guide$/, ''))
}

export function getCountryKeyFromSlug(slug: string): string | null {
  const normalized = slug.replace(/^\//, '')
  const countryMatch = normalized.match(/^guides\/([^/]+)-ivf-guide$/)
  if (countryMatch) return countryMatch[1]
  const flatCity = normalized.match(/^guides\/([^/]+)-([^/]+)-ivf-guide$/)
  if (flatCity) return flatCity[1]
  return null
}

export function parseCitySlug(slug: string): { countryKey: string; countryName: string; cityName: string } | null {
  const normalized = slug.replace(/^\//, '')
  const nested = normalized.match(/^guides\/([^/]+)\/(.+)-ivf-guide$/)
  if (nested) {
    const [, countryKey, citySegment] = nested
    return {
      countryKey,
      countryName: slugToLabel(countryKey),
      cityName: slugToLabel(citySegment),
    }
  }
  const flat = normalized.match(/^guides\/([^/]+)-([^/]+)-ivf-guide$/)
  if (flat) {
    const [, countryKey, citySegment] = flat
    return {
      countryKey,
      countryName: slugToLabel(countryKey),
      cityName: slugToLabel(citySegment),
    }
  }
  return null
}

export function getCitiesForCountryFromTaxonomy(
  taxonomy: Taxonomy,
  countryKey: string,
  locale: Locale,
): CityDisplay[] {
  const country = taxonomy.countries.find((c) => c.slug === countryKey)
  if (!country) return []

  return country.cities.map((city) => ({
    cityKey: city.slug,
    cityName: city.name,
    citySlug: `guides/${countryKey}/${city.slug}-ivf-guide`,
    href: clinicCityPath(countryKey, city.slug, locale),
    guideHref: guidePath(`${city.slug}-ivf-guide`, locale),
  }))
}

export function getCitiesForCountry(
  countryKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
  taxonomy?: Taxonomy,
): CityDisplay[] {
  if (taxonomy) {
    return getCitiesForCountryFromTaxonomy(taxonomy, countryKey, locale)
  }

  const fromApi = allCityPages.filter((p) =>
    p.slug.includes(`guides/${countryKey}/`) || p.slug.includes(`${countryKey}-`),
  )

  return fromApi
    .map((p) => {
      const parsed = parseCitySlug(p.slug)
      if (!parsed) return null
      const cityKey = parsed.cityName.toLowerCase().replace(/\s+/g, '-')
      return {
        cityKey,
        cityName: parsed.cityName,
        citySlug: p.slug.replace(/^\//, ''),
        href: clinicCityPath(countryKey, cityKey, locale),
        guideHref: localizedPath(`/${p.slug.replace(/^\//, '')}`, locale),
      }
    })
    .filter((c): c is CityDisplay => c !== null)
}

export function getCountryLandingPath(countryKey: string, locale: Locale = 'en'): string {
  return countryLandingPath(countryKey, locale)
}

export function getCityHubPath(
  countryKey: string,
  cityKey: string,
  locale: Locale = 'en',
): string {
  return clinicCityPath(countryKey, cityKey, locale)
}

export function getCountryGuideHref(countryKey: string, locale: Locale = 'en'): string {
  return guidePath(`${countryKey}-ivf-guide`, locale)
}

export function getCityGuideHref(
  countryKey: string,
  cityKey: string,
  locale: Locale = 'en',
): string {
  return guidePath(`${countryKey}-${cityKey}-ivf-guide`, locale)
}

export interface GuideArticleItem {
  slug: string
  href: string
  title: string
  description: string
  updatedAt: string
  kind: 'country' | 'city'
  countryKey: string
  countryName: string
  flag: string
}

export interface GuideCountryGroup {
  countryKey: string
  countryName: string
  flag: string
  countryGuide: GuideArticleItem | null
  cityGuides: GuideArticleItem[]
}

export function getGuideArticles(
  pages: ContentListItem[],
  locale: Locale,
  taxonomy?: Taxonomy,
): GuideArticleItem[] {
  return filterPagesByHub(pages, 'guides', locale).map((page) => {
    const slug = page.slug.replace(/^\//, '')
    let description = 'Patient guide'
    let kind: 'country' | 'city' = 'country'
    let countryKey = ''
    let countryName = ''
    let flag = '🌍'
    let title = pageTitleFromSlug(slug)

    if (isCountryGuideSlug(slug)) {
      countryKey = getCountryKeyFromSlug(slug) ?? ''
      const country = taxonomy?.countries.find((c) => c.slug === countryKey)
      countryName = country?.name ?? slugToLabel(countryKey)
      flag = country?.flagEmoji ?? '🌍'
      title = `${countryName} IVF Guide`
      description = country ? `${country.clinicCount} verified clinics` : description
    } else if (isCityGuideSlug(slug)) {
      kind = 'city'
      const parsed = parseCitySlug(slug)
      if (parsed) {
        countryKey = parsed.countryKey
        countryName = parsed.countryName
        title = `${parsed.cityName} IVF Guide`
        description = parsed.countryName
        const country = taxonomy?.countries.find((c) => c.slug === countryKey)
        flag = country?.flagEmoji ?? '🌍'
      }
    }

    return {
      slug,
      href: localizedPath(`/${slug}`, locale),
      title,
      description,
      updatedAt: page.updatedAt,
      kind,
      countryKey,
      countryName,
      flag,
    }
  })
}

export function partitionGuides(pages: ContentListItem[], locale?: Locale) {
  const filtered = locale ? filterPagesByLocale(pages, locale) : pages
  const countries: ContentListItem[] = []
  const cities: ContentListItem[] = []

  for (const page of filtered) {
    const slug = page.slug.replace(/^\//, '')
    if (isCountryGuideSlug(slug)) countries.push(page)
    else if (isCityGuideSlug(slug)) cities.push(page)
  }

  return { countries, cities }
}

export function getCountryDisplayFromTaxonomy(
  countrySlug: string,
  taxonomy: Taxonomy,
  locale: Locale = 'en',
) {
  const country = taxonomy.countries.find((c) => c.slug === countrySlug)
  const guideSlug = `guides/${countrySlug}-ivf-guide`
  return {
    name: country?.name ?? slugToLabel(countrySlug),
    flag: country?.flagEmoji ?? '🌍',
    tagline: country && country.clinicCount > 0 ? `${country.clinicCount} verified clinics` : '',
    cost: '',
    clinics: country ? String(country.clinicCount) : '',
    slug: guideSlug,
    href: getCountryLandingPath(countrySlug, locale),
    guideHref: getCountryGuideHref(countrySlug, locale),
  }
}

export function getFeaturedCountriesFromTaxonomy(taxonomy: Taxonomy, locale: Locale = 'en') {
  return taxonomy.countries.map((country) => ({
    slug: `guides/${country.slug}-ivf-guide`,
    href: clinicCountryPath(country.slug, locale),
    countryHref: countryLandingPath(country.slug, locale),
    guideHref: getCountryGuideHref(country.slug, locale),
    name: country.name,
    flag: country.flagEmoji ?? '🌍',
    tagline: country.clinicCount > 0 ? `${country.clinicCount} verified clinics` : '',
    cost: '',
    clinics: String(country.clinicCount),
  }))
}

/** @deprecated Use getCountryDisplayFromTaxonomy with taxonomy */
export function getCountryDisplay(slug: string, locale: Locale, taxonomy: Taxonomy) {
  const countryKey = getCountryKeyFromSlug(slug) ?? slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
  return getCountryDisplayFromTaxonomy(countryKey, taxonomy, locale)
}

/** @deprecated Use getFeaturedCountriesFromTaxonomy */
export function getFeaturedCountries(locale: Locale, taxonomy: Taxonomy) {
  return getFeaturedCountriesFromTaxonomy(taxonomy, locale)
}

export function getRelatedGuideSlugsForCountry(
  countryKey: string,
  cityPages: ContentListItem[],
): string[] {
  const slugs = [`guides/${countryKey}-ivf-guide`]
  for (const page of cityPages) {
    const parsed = parseCitySlug(page.slug)
    if (parsed?.countryKey === countryKey) {
      slugs.push(page.slug.replace(/^\//, ''))
    }
  }
  return slugs
}

export function getRelatedGuideSlugsForCity(
  countryKey: string,
  cityKey: string,
  cityPages: ContentListItem[],
): string[] {
  const slugs = [`guides/${countryKey}-ivf-guide`]
  for (const page of cityPages) {
    const parsed = parseCitySlug(page.slug)
    if (parsed?.countryKey !== countryKey) continue
    const pageCityKey = page.slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1]
    if (pageCityKey && pageCityKey !== cityKey) {
      slugs.push(page.slug.replace(/^\//, ''))
    }
  }
  return slugs
}

export function getRelatedGuideSlugsForTreatment(
  countryPages: ContentListItem[],
  cityPages: ContentListItem[],
): string[] {
  const slugs = countryPages.map((p) => p.slug.replace(/^\//, ''))
  for (const page of cityPages.slice(0, 12)) {
    slugs.push(page.slug.replace(/^\//, ''))
  }
  return slugs
}
