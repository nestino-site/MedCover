import type { ContentListItem } from '@/lib/api/types'
import type { Taxonomy } from '@/lib/api/types'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import { resolvePageRelations, guideTitleForPage } from '@/lib/content/link-graph'
import { localizedPath, type Locale } from '@/lib/i18n'
import { filterPagesByLocale } from './site-graph'
import {
  clinicCityPath,
  clinicCityTreatmentPath,
  clinicCountryPath,
  clinicCountryTreatmentPath,
  clinicPdpPath,
  cityLandingPath,
  countryLandingPath,
  guidePath,
  slugToLabel,
} from '@/lib/routes'

export interface CityDisplay {
  cityKey: string
  cityName: string
  citySlug: string
  href: string
  clinicHref: string
  guideHref: string
}

export type CityLinkOptions = {
  treatment?: string
  /** editorial = city landing (default); clinic = city PLP; clinic_treatment = treatment-scoped city PLP */
  hrefMode?: 'editorial' | 'clinic' | 'clinic_treatment'
}

export interface RelatedArticleItem {
  title: string
  href: string
}

const COUNTRY_SLUG_RE = /^guides\/[^/]+-ivf-guide$/
const CITY_SLUG_RE = /^guides\/([^/]+)\/.+-ivf-guide$|^guides\/[^/]+\/[^/]+$/

export function isCountryGuideSlug(slug: string, taxonomy?: Taxonomy): boolean {
  const normalized = slug.replace(/^\//, '')
  if (!COUNTRY_SLUG_RE.test(normalized)) return false
  const countryKey = getCountryKeyFromSlug(normalized)
  if (!countryKey) return false
  if (taxonomy) {
    return taxonomy.countries.some((c) => c.slug === countryKey)
  }
  return true
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
  options?: CityLinkOptions,
): CityDisplay[] {
  const country = taxonomy.countries.find((c) => c.slug === countryKey)
  if (!country) return []

  return country.cities.map((city) => {
    const clinicHref = options?.treatment
      ? clinicCityTreatmentPath(countryKey, city.slug, options.treatment, locale)
      : clinicCityPath(countryKey, city.slug, locale)
    const href =
      options?.hrefMode === 'clinic_treatment' && options.treatment
        ? clinicCityTreatmentPath(countryKey, city.slug, options.treatment, locale)
        : options?.hrefMode === 'clinic'
          ? clinicCityPath(countryKey, city.slug, locale)
          : cityLandingPath(countryKey, city.slug, locale)

    return {
      cityKey: city.slug,
      cityName: city.name,
      citySlug: `guides/${countryKey}/${city.slug}-ivf-guide`,
      href,
      clinicHref,
      guideHref: guidePath(`${city.slug}-ivf-guide`, locale),
    }
  })
}

export function getCitiesForCountry(
  countryKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
  taxonomy?: Taxonomy,
  options?: CityLinkOptions,
): CityDisplay[] {
  if (taxonomy) {
    return getCitiesForCountryFromTaxonomy(taxonomy, countryKey, locale, options)
  }

  const fromApi = allCityPages.filter((p) =>
    p.slug.includes(`guides/${countryKey}/`) || p.slug.includes(`${countryKey}-`),
  )

  return fromApi
    .map((p) => {
      const parsed = parseCitySlug(p.slug)
      if (!parsed) return null
      const cityKey = parsed.cityName.toLowerCase().replace(/\s+/g, '-')
      const clinicHref = options?.treatment
        ? clinicCityTreatmentPath(countryKey, cityKey, options.treatment, locale)
        : clinicCityPath(countryKey, cityKey, locale)
      const href =
        options?.hrefMode === 'clinic_treatment' && options.treatment
          ? clinicCityTreatmentPath(countryKey, cityKey, options.treatment, locale)
          : options?.hrefMode === 'clinic'
            ? clinicCityPath(countryKey, cityKey, locale)
            : cityLandingPath(countryKey, cityKey, locale)

      return {
        cityKey,
        cityName: parsed.cityName,
        citySlug: p.slug.replace(/^\//, ''),
        href,
        clinicHref,
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
  return cityLandingPath(countryKey, cityKey, locale)
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
  kind: 'country' | 'city' | 'other'
  countryKey: string
  countryName: string
  flag: string
}

function isGuideListPage(page: ContentListItem): boolean {
  if (page.pageType) return page.pageType === 'guide'
  const slug = page.slug.replace(/^\//, '')
  return slug.startsWith('guides/') && slug.length > 'guides/'.length
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
  return filterPagesByHub(pages, 'guides', locale)
    .filter(isGuideListPage)
    .map((page) => {
      const slug = page.slug.replace(/^\//, '')
      const relations = resolvePageRelations(page, taxonomy)
      const title = guideTitleForPage(page, relations, taxonomy)
      let description = 'Patient guide'
      let kind: GuideArticleItem['kind'] = 'other'
      let countryKey = ''
      let countryName = ''
      let flag = '🌍'

      if (relations.city && relations.country && taxonomy) {
        kind = 'city'
        countryKey = relations.country
        const country = taxonomy.countries.find((c) => c.slug === countryKey)
        countryName = country?.name ?? slugToLabel(countryKey)
        const city = country?.cities.find((c) => c.slug === relations.city)
        description = city?.name ?? relations.city
        flag = flagEmojiForCountry({
          slug: countryKey,
          flagEmoji: country?.flagEmoji,
          codeIso2: country?.codeIso2,
        })
      } else if (relations.country && taxonomy) {
        kind = 'country'
        countryKey = relations.country
        const country = taxonomy.countries.find((c) => c.slug === countryKey)
        countryName = country?.name ?? slugToLabel(countryKey)
        description = country ? `${country.clinicCount} verified clinics` : description
        flag = flagEmojiForCountry({
          slug: countryKey,
          flagEmoji: country?.flagEmoji,
          codeIso2: country?.codeIso2,
        })
      } else if (isCountryGuideSlug(slug)) {
        kind = 'country'
        countryKey = getCountryKeyFromSlug(slug) ?? ''
        const country = taxonomy?.countries.find((c) => c.slug === countryKey)
        countryName = country?.name ?? slugToLabel(countryKey)
        description = country ? `${country.clinicCount} verified clinics` : description
        flag = flagEmojiForCountry({
          slug: countryKey,
          flagEmoji: country?.flagEmoji,
          codeIso2: country?.codeIso2,
        })
      } else if (isCityGuideSlug(slug)) {
        kind = 'city'
        const parsed = parseCitySlug(slug)
        if (parsed) {
          countryKey = parsed.countryKey
          countryName = parsed.countryName
          description = parsed.countryName
          const country = taxonomy?.countries.find((c) => c.slug === countryKey)
          flag = flagEmojiForCountry({
            slug: countryKey,
            flagEmoji: country?.flagEmoji,
            codeIso2: country?.codeIso2,
          })
        }
      } else {
        countryKey = 'general'
        countryName = 'Guides'
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

export function partitionGuides(
  pages: ContentListItem[],
  locale?: Locale,
  taxonomy?: Taxonomy,
) {
  const filtered = locale ? filterPagesByLocale(pages, locale) : pages
  const countries: ContentListItem[] = []
  const cities: ContentListItem[] = []
  const uncategorized: ContentListItem[] = []
  const seen = new Set<string>()

  const add = (bucket: ContentListItem[], page: ContentListItem) => {
    const key = page.slug.replace(/^\//, '')
    if (seen.has(key)) return
    seen.add(key)
    bucket.push(page)
  }

  if (!taxonomy) {
    for (const page of filtered) {
      const slug = page.slug.replace(/^\//, '')
      if (isCountryGuideSlug(slug)) add(countries, page)
      else if (isCityGuideSlug(slug)) add(cities, page)
    }
    return { countries, cities, uncategorized }
  }

  for (const page of filtered) {
    if (!isGuideListPage(page)) continue
    const slug = page.slug.replace(/^\//, '')
    const relations = resolvePageRelations(page, taxonomy)
    if (relations.city) {
      add(cities, page)
    } else if (relations.country && taxonomy.countries.some((c) => c.slug === relations.country)) {
      add(countries, page)
    } else if (isCountryGuideSlug(slug, taxonomy)) {
      add(countries, page)
    } else if (isCityGuideSlug(slug) || parseCitySlug(slug)) {
      add(cities, page)
    } else {
      add(uncategorized, page)
    }
  }

  return { countries, cities, uncategorized }
}

/** Map of published city guides keyed by `countryKey/cityKey`. */
export function publishedCityGuideKeys(
  pages: ContentListItem[],
  locale: Locale,
  taxonomy: Taxonomy,
): Set<string> {
  const { cities } = partitionGuides(pages, locale, taxonomy)
  const keys = new Set<string>()
  for (const page of cities) {
    const relations = resolvePageRelations(page, taxonomy)
    if (relations.country && relations.city) {
      keys.add(`${relations.country}/${relations.city}`)
    }
  }
  return keys
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
    flag: flagEmojiForCountry({
      slug: countrySlug,
      flagEmoji: country?.flagEmoji,
      codeIso2: country?.codeIso2,
    }),
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
    flag: flagEmojiForCountry({
      slug: country.slug,
      flagEmoji: country.flagEmoji,
      codeIso2: country.codeIso2,
    }),
    tagline: country.clinicCount > 0 ? `${country.clinicCount} verified clinics` : '',
    cost: '',
    clinics: String(country.clinicCount),
  }))
}

export interface NavFeaturedCity {
  cityName: string
  countryName: string
  countryKey: string
  cityKey: string
  flag: string
  overviewHref: string
  clinicHref: string
  guideHref: string | null
}

export function getFeaturedCitiesForNav(
  taxonomy: Taxonomy,
  locale: Locale = 'en',
  limit = 8,
  publishedGuideKeys?: Set<string>,
): NavFeaturedCity[] {
  const entries: Array<NavFeaturedCity & { clinicCount: number }> = []

  for (const country of taxonomy.countries) {
    const flag = flagEmojiForCountry({
      slug: country.slug,
      flagEmoji: country.flagEmoji,
      codeIso2: country.codeIso2,
    })

    for (const city of country.cities) {
      const guideKey = `${country.slug}/${city.slug}`
      const hasPublishedGuide = publishedGuideKeys?.has(guideKey) ?? false

      entries.push({
        cityName: city.name,
        countryName: country.name,
        countryKey: country.slug,
        cityKey: city.slug,
        flag,
        overviewHref: cityLandingPath(country.slug, city.slug, locale),
        clinicHref: clinicCityPath(country.slug, city.slug, locale),
        guideHref: hasPublishedGuide
          ? getCityGuideHref(country.slug, city.slug, locale)
          : null,
        clinicCount: city.clinicCount,
      })
    }
  }

  return entries
    .sort(
      (a, b) =>
        b.clinicCount - a.clinicCount ||
        a.countryName.localeCompare(b.countryName) ||
        a.cityName.localeCompare(b.cityName),
    )
    .slice(0, limit)
    .map(({ clinicCount: _clinicCount, ...city }) => city)
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
