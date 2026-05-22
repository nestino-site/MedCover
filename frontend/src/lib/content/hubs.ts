import type { ContentListItem } from '@/lib/api/types'
import { localizedPath, type Locale } from '@/lib/i18n'
import { filterPagesByLocale } from './site-graph'

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
