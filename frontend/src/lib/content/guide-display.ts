import 'server-only'
import type { ContentListItem, ContentPage } from '@/lib/api/types'
import { loadPublishedPage } from '@/lib/api/content'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  countryMeta,
  getCountryKeyFromSlug,
  isCityGuideSlug,
  isCountryGuideSlug,
  pageTitleFromSlug,
  parseCitySlug,
  partitionGuides,
  type GuideArticleItem,
  type GuideCountryGroup,
} from '@/lib/content/hubs'

export type GuideSeoDisplay = {
  title: string
  description: string
}

export type GuideSummaryMap = Map<string, GuideSeoDisplay>

export function resolveGuideSeo(page: ContentPage, slug: string): GuideSeoDisplay {
  const { seo } = page
  const title =
    seo.metaTitle?.trim() ||
    seo.title?.trim() ||
    seo.og.title?.trim() ||
    pageTitleFromSlug(slug)
  const description =
    seo.metaDescription?.trim() ||
    seo.og.description?.trim() ||
    seo.twitter.description?.trim() ||
    ''

  return { title, description }
}

function fallbackTitleAndDescription(slug: string): GuideSeoDisplay {
  const normalized = slug.replace(/^\//, '')

  if (isCountryGuideSlug(normalized)) {
    const meta = countryMeta[normalized]
    if (meta) {
      return {
        title: `${meta.name} IVF Guide`,
        description: meta.tagline,
      }
    }
    const countryKey = getCountryKeyFromSlug(normalized)
    return {
      title: pageTitleFromSlug(normalized),
      description: countryKey ? 'Country guide' : 'Patient guide',
    }
  }

  if (isCityGuideSlug(normalized)) {
    const parsed = parseCitySlug(normalized)
    if (parsed) {
      return {
        title: `${parsed.cityName} IVF Guide`,
        description: parsed.countryName,
      }
    }
  }

  return {
    title: pageTitleFromSlug(normalized),
    description: 'Patient guide',
  }
}

export async function loadGuideSummaries(slugs: string[]): Promise<GuideSummaryMap> {
  const unique = [...new Set(slugs.map((s) => s.replace(/^\//, '')))]
  const results = await Promise.all(
    unique.map(async (slug) => {
      const result = await loadPublishedPage(slug)
      if (result.status === 'ok') {
        return [slug, resolveGuideSeo(result.page, slug)] as const
      }
      return [slug, fallbackTitleAndDescription(slug)] as const
    }),
  )
  return new Map(results)
}

function buildGuideArticleItem(
  page: ContentListItem,
  locale: Locale,
  summaries: GuideSummaryMap,
): GuideArticleItem | null {
  const slug = page.slug.replace(/^\//, '')
  const href = localizedPath(`/${slug}`, locale)
  const seo = summaries.get(slug) ?? fallbackTitleAndDescription(slug)

  if (isCountryGuideSlug(slug)) {
    const countryKey = getCountryKeyFromSlug(slug) ?? ''
    const meta = countryMeta[slug]
    return {
      slug,
      href,
      title: seo.title,
      description: seo.description || meta?.tagline || '',
      updatedAt: page.updatedAt,
      kind: 'country',
      countryKey,
      countryName: meta?.name ?? pageTitleFromSlug(slug),
      flag: meta?.flag ?? '🌍',
    }
  }

  if (isCityGuideSlug(slug)) {
    const parsed = parseCitySlug(slug)
    if (!parsed) return null
    const countrySlug = `guides/${parsed.countryKey}-ivf-guide`
    const meta = countryMeta[countrySlug]
    return {
      slug,
      href,
      title: seo.title,
      description: seo.description || parsed.countryName,
      updatedAt: page.updatedAt,
      kind: 'city',
      countryKey: parsed.countryKey,
      countryName: parsed.countryName,
      flag: meta?.flag ?? '🌍',
    }
  }

  return null
}

const FEATURED_COUNTRY_ORDER = Object.keys(countryMeta).map((slug) =>
  getCountryKeyFromSlug(slug),
).filter((k): k is string => k != null)

function countrySortIndex(countryKey: string): number {
  const idx = FEATURED_COUNTRY_ORDER.indexOf(countryKey)
  return idx === -1 ? FEATURED_COUNTRY_ORDER.length : idx
}

export function buildGuideGroups(
  pages: ContentListItem[],
  summaries: GuideSummaryMap,
  locale: Locale,
): GuideCountryGroup[] {
  const { countries, cities } = partitionGuides(pages, locale)
  const groupMap = new Map<string, GuideCountryGroup>()

  for (const page of countries) {
    const item = buildGuideArticleItem(page, locale, summaries)
    if (!item) continue
    groupMap.set(item.countryKey, {
      countryKey: item.countryKey,
      countryName: item.countryName,
      flag: item.flag,
      countryGuide: item,
      cityGuides: [],
    })
  }

  for (const page of cities) {
    const item = buildGuideArticleItem(page, locale, summaries)
    if (!item) continue
    if (!groupMap.has(item.countryKey)) {
      groupMap.set(item.countryKey, {
        countryKey: item.countryKey,
        countryName: item.countryName,
        flag: item.flag,
        countryGuide: null,
        cityGuides: [],
      })
    }
    groupMap.get(item.countryKey)!.cityGuides.push(item)
  }

  const groups = [...groupMap.values()]
  for (const group of groups) {
    group.cityGuides.sort((a, b) => a.title.localeCompare(b.title))
  }

  groups.sort(
    (a, b) =>
      countrySortIndex(a.countryKey) - countrySortIndex(b.countryKey) ||
      a.countryName.localeCompare(b.countryName),
  )

  return groups
}

export function flattenGuideGroups(groups: GuideCountryGroup[]): GuideArticleItem[] {
  const items: GuideArticleItem[] = []
  for (const group of groups) {
    if (group.countryGuide) items.push(group.countryGuide)
    items.push(...group.cityGuides)
  }
  return items
}

export { filterGuideGroups } from '@/lib/content/guide-group-filters'

export async function loadGuidePostsBySlugs(
  slugs: string[],
  locale: Locale,
): Promise<GuideArticleItem[]> {
  const normalized = [...new Set(slugs.map((s) => s.replace(/^\//, '')))]
  if (normalized.length === 0) return []

  const summaries = await loadGuideSummaries(normalized)
  const stubPages: ContentListItem[] = normalized.map((slug) => ({
    id: 0,
    slug,
    language: locale,
    updatedAt: '',
  }))

  return stubPages
    .map((page) => buildGuideArticleItem(page, locale, summaries))
    .filter((item): item is GuideArticleItem => item != null)
}

export async function loadGuideArticlesBySlugs(
  slugs: string[],
  pages: ContentListItem[],
  locale: Locale,
): Promise<GuideArticleItem[]> {
  const normalized = [...new Set(slugs.map((s) => s.replace(/^\//, '')))]
  if (normalized.length === 0) return []

  const summaries = await loadGuideSummaries(normalized)
  const pageBySlug = new Map(pages.map((p) => [p.slug.replace(/^\//, ''), p]))

  return normalized
    .map((slug) => {
      const page = pageBySlug.get(slug) ?? {
        id: 0,
        slug,
        language: locale,
        updatedAt: '',
      }
      return buildGuideArticleItem(page, locale, summaries)
    })
    .filter((item): item is GuideArticleItem => item != null)
}

export interface PublishedPostItem {
  slug: string
  href: string
  title: string
  description: string
  updatedAt: string
}

export async function loadPublishedPostItems(
  pages: ContentListItem[],
  locale: Locale,
): Promise<PublishedPostItem[]> {
  const slugs = pages.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs)

  return pages.map((page) => {
    const slug = page.slug.replace(/^\//, '')
    const seo = summaries.get(slug) ?? {
      title: pageTitleFromSlug(slug),
      description: '',
    }
    return {
      slug,
      href: localizedPath(`/${slug}`, locale),
      title: seo.title,
      description: seo.description,
      updatedAt: page.updatedAt,
    }
  })
}

export async function loadGuideGroupsForPages(
  pages: ContentListItem[],
  locale: Locale,
): Promise<GuideCountryGroup[]> {
  const { countries, cities } = partitionGuides(pages, locale)
  const allPages = [...countries, ...cities]
  const slugs = allPages.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs)
  return buildGuideGroups(pages, summaries, locale)
}

export function limitGuideGroupsForNav(
  groups: GuideCountryGroup[],
  maxItems = 12,
): GuideCountryGroup[] {
  const limited: GuideCountryGroup[] = []
  let count = 0

  for (const group of groups) {
    if (count >= maxItems) break
    const next: GuideCountryGroup = {
      ...group,
      countryGuide: null,
      cityGuides: [],
    }

    if (group.countryGuide && count < maxItems) {
      next.countryGuide = group.countryGuide
      count += 1
    }

    for (const city of group.cityGuides) {
      if (count >= maxItems) break
      next.cityGuides.push(city)
      count += 1
    }

    if (next.countryGuide || next.cityGuides.length > 0) {
      limited.push(next)
    }
  }

  return limited
}
