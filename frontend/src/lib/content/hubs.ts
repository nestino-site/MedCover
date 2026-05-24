import type { ContentListItem } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import { filterPagesByLocale } from './site-graph'

export interface CityDisplay {
  cityKey: string
  cityName: string
  citySlug: string
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
  return Object.entries(countryMeta).map(([slug, meta]) => ({
    slug,
    href: localizedPath(`/${slug}`, locale),
    ...meta,
  }))
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
        return {
          cityKey,
          cityName: parsed.cityName,
          citySlug: p.slug,
          href: localizedPath(`/${p.slug}`, locale),
        }
      })
      .filter((c): c is CityDisplay => c !== null)
  }
  const fallback = staticCitiesPerCountry[countryKey] ?? []
  return fallback.map((cityKey) => ({
    cityKey,
    cityName: slugToLabel(cityKey),
    citySlug: `guides/${countryKey}/${cityKey}-ivf-guide`,
    href: localizedPath(`/guides/${countryKey}/${cityKey}-ivf-guide`, locale),
  }))
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

export function getCountryDisplay(slug: string, locale: Locale = 'en') {
  const meta = countryMeta[slug]
  if (meta) return { ...meta, slug, href: localizedPath(`/${slug}`, locale) }

  const name = slugToLabel(slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''))
  return {
    name,
    flag: '🌍',
    tagline: 'IVF destination guide',
    cost: '',
    clinics: '',
    slug,
    href: localizedPath(`/${slug}`, locale),
  }
}
