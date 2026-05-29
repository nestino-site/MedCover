import type { ContentListItem } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import { filterPagesByLocale } from './site-graph'

export interface CityDisplay {
  cityKey: string
  cityName: string
  citySlug: string
  /** Canonical city hub URL */
  href: string
  /** Published IVF guide article */
  guideHref: string
}

export interface RelatedArticleItem {
  title: string
  href: string
}

export const staticCitiesPerCountry: Record<string, string[]> = {
  'spain':           ['barcelona', 'madrid', 'valencia'],
  'greece':          ['athens', 'thessaloniki'],
  'czech-republic':  ['prague', 'brno'],
  'turkey':          ['istanbul', 'ankara'],
  'portugal':        ['lisbon', 'porto'],
  'north-macedonia': ['skopje'],
}

const COUNTRY_SLUG_RE = /^guides\/[^/]+-ivf-guide$/
const CITY_SLUG_RE = /^guides\/[^/]+\/.+-ivf-guide$/

export const countryMeta: Record<
  string,
  { name: string; flag: string; tagline: string; cost: string; clinics: string }
> = {
  'guides/spain-ivf-guide': {
    name: 'Spain',
    flag: '🇪🇸',
    tagline: 'Top-rated egg donation',
    cost: 'from €3,200',
    clinics: '12 clinics',
  },
  'guides/greece-ivf-guide': {
    name: 'Greece',
    flag: '🇬🇷',
    tagline: 'Mediterranean care',
    cost: 'from €2,800',
    clinics: '8 clinics',
  },
  'guides/czech-republic-ivf-guide': {
    name: 'Czech Republic',
    flag: '🇨🇿',
    tagline: 'Affordable & experienced',
    cost: 'from €2,400',
    clinics: '4 clinics',
  },
  'guides/turkey-ivf-guide': {
    name: 'Turkey',
    flag: '🇹🇷',
    tagline: 'Growing success rates',
    cost: 'from €2,600',
    clinics: '6 clinics',
  },
  'guides/portugal-ivf-guide': {
    name: 'Portugal',
    flag: '🇵🇹',
    tagline: 'Atlantic coast option',
    cost: 'from €3,000',
    clinics: '5 clinics',
  },
  'guides/north-macedonia-ivf-guide': {
    name: 'North Macedonia',
    flag: '🇲🇰',
    tagline: 'Budget-friendly',
    cost: 'from €1,900',
    clinics: '3 clinics',
  },
}

export function getFeaturedCountries(locale: Locale = 'en') {
  return Object.entries(countryMeta).map(([slug, meta]) => {
    const countryKey = getCountryKeyFromSlug(slug) ?? ''
    return {
      slug,
      href: getCountryLandingPath(countryKey, locale),
      guideHref: localizedPath(`/${slug}`, locale),
      ...meta,
    }
  })
}

/** @deprecated Use getFeaturedCountries(locale) */
export const featuredCountries = getFeaturedCountries('en')

export function isCountryGuideSlug(slug: string): boolean {
  return COUNTRY_SLUG_RE.test(slug)
}

export function isCityGuideSlug(slug: string): boolean {
  return CITY_SLUG_RE.test(slug)
}

/** Pages published under a hub segment, e.g. hub `costs` → `/costs/spain-ivf-financing-202`. */
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
  return slugToLabel(last)
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
): GuideArticleItem[] {
  return filterPagesByHub(pages, 'guides', locale).map((page) => {
    const slug = page.slug.replace(/^\//, '')
    const normalized = slug.replace(/^\//, '')
    let description = 'Patient guide'
    let kind: 'country' | 'city' = 'country'
    let countryKey = ''
    let countryName = ''
    let flag = '🌍'
    let title = pageTitleFromSlug(slug)

    if (isCountryGuideSlug(normalized)) {
      const meta = countryMeta[normalized]
      countryKey = getCountryKeyFromSlug(normalized) ?? ''
      countryName = meta?.name ?? title
      flag = meta?.flag ?? '🌍'
      title = meta ? `${meta.name} IVF Guide` : title
      description = meta?.tagline ?? description
    } else if (isCityGuideSlug(normalized)) {
      kind = 'city'
      const parsed = parseCitySlug(normalized)
      if (parsed) {
        countryKey = parsed.countryKey
        countryName = parsed.countryName
        title = `${parsed.cityName} IVF Guide`
        description = parsed.countryName
        const countrySlug = `guides/${parsed.countryKey}-ivf-guide`
        flag = countryMeta[countrySlug]?.flag ?? '🌍'
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

export function slugToLabel(segment: string): string {
  return segment
    .replace(/-ivf-guide$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function parseCitySlug(slug: string): { countryKey: string; countryName: string; cityName: string } | null {
  const normalized = slug.replace(/^\//, '')
  const match = normalized.match(/^guides\/([^/]+)\/(.+)-ivf-guide$/)
  if (!match) return null

  const [, countryKey, citySegment] = match
  const countrySlug = `guides/${countryKey}-ivf-guide`
  const countryName = countryMeta[countrySlug]?.name ?? slugToLabel(countryKey)

  return {
    countryKey,
    countryName,
    cityName: slugToLabel(citySegment),
  }
}

export function getCountryKeyFromSlug(slug: string): string | null {
  return slug.match(/^guides\/([^/]+)-ivf-guide$/)?.[1] ?? null
}

export function getCitiesForCountry(
  countryKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
): CityDisplay[] {
  const fromApi = allCityPages.filter((p) =>
    p.slug.startsWith(`guides/${countryKey}/`)
  )
  if (fromApi.length > 0) {
    return fromApi
      .map((p) => {
        const parsed = parseCitySlug(p.slug)
        if (!parsed) return null
        const cityKey = p.slug.match(/^guides\/[^/]+\/(.+)-ivf-guide$/)?.[1] ?? ''
        const guideSlug = p.slug.replace(/^\//, '')
        return {
          cityKey,
          cityName: parsed.cityName,
          citySlug: guideSlug,
          href: getCityHubPath(countryKey, cityKey, locale),
          guideHref: localizedPath(`/${guideSlug}`, locale),
        }
      })
      .filter((c): c is CityDisplay => c !== null)
  }
  const fallback = staticCitiesPerCountry[countryKey] ?? []
  return fallback.map((cityKey) => {
    const guideSlug = `guides/${countryKey}/${cityKey}-ivf-guide`
    return {
      cityKey,
      cityName: slugToLabel(cityKey),
      citySlug: guideSlug,
      href: getCityHubPath(countryKey, cityKey, locale),
      guideHref: localizedPath(`/${guideSlug}`, locale),
    }
  })
}

export function getStaticGuidePages(locale: Locale): ContentListItem[] {
  const result: ContentListItem[] = []

  for (const slug of Object.keys(countryMeta)) {
    result.push({ id: 0, slug, language: locale, updatedAt: '' })
  }

  for (const [countryKey, cities] of Object.entries(staticCitiesPerCountry)) {
    for (const cityKey of cities) {
      result.push({
        id: 0,
        slug: `guides/${countryKey}/${cityKey}-ivf-guide`,
        language: locale,
        updatedAt: '',
      })
    }
  }

  return result
}

export function getCountryLandingPath(countryKey: string, locale: Locale = 'en'): string {
  return localizedPath(`/countries/${countryKey}`, locale)
}

export function getCityHubPath(
  countryKey: string,
  cityKey: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/cities/${countryKey}/${cityKey}`, locale)
}

export function getCountryGuideHref(countryKey: string, locale: Locale = 'en'): string {
  return localizedPath(`/guides/${countryKey}-ivf-guide`, locale)
}

export function getCityGuideHref(
  countryKey: string,
  cityKey: string,
  locale: Locale = 'en',
): string {
  return localizedPath(`/guides/${countryKey}/${cityKey}-ivf-guide`, locale)
}

/** Guide article slugs for a country hub (country + city guides). */
export function getRelatedGuideSlugsForCountry(
  countryKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
): string[] {
  const slugs: string[] = [`guides/${countryKey}-ivf-guide`]
  for (const city of getCitiesForCountry(countryKey, allCityPages, locale)) {
    slugs.push(city.citySlug.replace(/^\//, ''))
  }
  return slugs
}

/** @deprecated Use getRelatedGuideSlugsForCountry + loadGuideArticlesBySlugs */
export function getRelatedGuidesForCountry(
  countryKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
): RelatedArticleItem[] {
  return getRelatedGuideSlugsForCountry(countryKey, allCityPages, locale).map((slug) => {
    const meta = countryMeta[slug]
    const href = localizedPath(`/${slug}`, locale)
    if (meta) {
      return { title: `${meta.name} IVF Guide`, href }
    }
    const parsed = parseCitySlug(slug)
    if (parsed) {
      return { title: `${parsed.cityName} IVF Guide`, href }
    }
    return { title: pageTitleFromSlug(slug), href }
  })
}

/** Guide article slugs for a city hub (city, country, sibling cities). */
export function getRelatedGuideSlugsForCity(
  countryKey: string,
  cityKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
): string[] {
  const cities = getCitiesForCountry(countryKey, allCityPages, locale)
  const current = cities.find((c) => c.cityKey === cityKey)
  const slugs: string[] = []

  if (current) {
    slugs.push(current.citySlug.replace(/^\//, ''))
  }

  slugs.push(`guides/${countryKey}-ivf-guide`)

  for (const city of cities) {
    if (city.cityKey === cityKey) continue
    slugs.push(city.citySlug.replace(/^\//, ''))
  }

  return slugs
}

/** @deprecated Use getRelatedGuideSlugsForCity + loadGuideArticlesBySlugs */
export function getRelatedGuidesForCity(
  countryKey: string,
  cityKey: string,
  allCityPages: ContentListItem[],
  locale: Locale,
): RelatedArticleItem[] {
  const cities = getCitiesForCountry(countryKey, allCityPages, locale)
  const current = cities.find((c) => c.cityKey === cityKey)
  const countrySlug = `guides/${countryKey}-ivf-guide`
  const countryName = countryMeta[countrySlug]?.name ?? slugToLabel(countryKey)
  const items: RelatedArticleItem[] = []

  if (current) {
    items.push({
      title: `${current.cityName} IVF Guide`,
      href: current.guideHref,
    })
  }

  items.push({
    title: `${countryName} IVF Guide`,
    href: getCountryGuideHref(countryKey, locale),
  })

  for (const city of cities) {
    if (city.cityKey === cityKey) continue
    items.push({
      title: `${city.cityName} IVF Guide`,
      href: city.guideHref,
    })
  }

  return items
}

/** Guide article slugs for treatment hub (all country + city guides). */
export function getRelatedGuideSlugsForTreatment(
  countryPages: ContentListItem[],
  cityPages: ContentListItem[],
  locale: Locale,
): string[] {
  const slugs: string[] = []

  for (const page of countryPages) {
    slugs.push(page.slug.replace(/^\//, ''))
  }
  for (const page of cityPages) {
    slugs.push(page.slug.replace(/^\//, ''))
  }

  if (slugs.length === 0) {
    for (const slug of Object.keys(countryMeta)) {
      const countryKey = getCountryKeyFromSlug(slug)
      if (!countryKey) continue
      slugs.push(slug)
      for (const city of getCitiesForCountry(countryKey, [], locale)) {
        slugs.push(city.citySlug.replace(/^\//, ''))
      }
    }
  }

  return slugs
}

/** @deprecated Use getRelatedGuideSlugsForTreatment + loadGuideArticlesBySlugs */
export function getRelatedGuidesForTreatment(
  countryPages: ContentListItem[],
  cityPages: ContentListItem[],
  locale: Locale,
): RelatedArticleItem[] {
  const items: RelatedArticleItem[] = []

  for (const page of countryPages) {
    const slug = page.slug.replace(/^\//, '')
    const meta = countryMeta[slug]
    if (!meta) continue
    items.push({
      title: `${meta.name} IVF Guide`,
      href: localizedPath(`/${slug}`, locale),
    })
  }

  for (const page of cityPages) {
    const slug = page.slug.replace(/^\//, '')
    const parsed = parseCitySlug(slug)
    if (!parsed) continue
    items.push({
      title: `${parsed.cityName} IVF Guide`,
      href: localizedPath(`/${slug}`, locale),
    })
  }

  if (items.length === 0) {
    for (const [slug, meta] of Object.entries(countryMeta)) {
      const countryKey = getCountryKeyFromSlug(slug)
      if (!countryKey) continue
      items.push({
        title: `${meta.name} IVF Guide`,
        href: localizedPath(`/${slug}`, locale),
      })
      for (const city of getCitiesForCountry(countryKey, [], locale)) {
        items.push({
          title: `${city.cityName} IVF Guide`,
          href: city.guideHref,
        })
      }
    }
  }

  return items
}

export function getCountryDisplay(slug: string, locale: Locale = 'en') {
  const countryKey = getCountryKeyFromSlug(slug)
  const guideHref = localizedPath(`/${slug}`, locale)

  if (countryMeta[slug]) {
    const meta = countryMeta[slug]
    return {
      ...meta,
      slug,
      href: countryKey ? getCountryLandingPath(countryKey, locale) : guideHref,
      guideHref,
    }
  }

  const name = slugToLabel(slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''))
  return {
    name,
    flag: '🌍',
    tagline: 'IVF destination guide',
    cost: '',
    clinics: '',
    slug,
    href: countryKey ? getCountryLandingPath(countryKey, locale) : guideHref,
    guideHref,
  }
}
