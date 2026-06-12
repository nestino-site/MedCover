import 'server-only'
import type { ContentListItem, ContentPage } from '@/lib/api/types'
import { loadPublishedPage } from '@/lib/api/content'
import { localizedPath, type Locale } from '@/lib/i18n'
import type { Taxonomy } from '@/lib/api/types'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import {
  findRelatedGuidePages,
  guideTitleForPage,
  resolvePageRelations,
  type PageEntities,
} from '@/lib/content/link-graph'
import {
  getCountryDisplayFromTaxonomy,
  getCountryKeyFromSlug,
  isCityGuideSlug,
  isCountryGuideSlug,
  pageTitleFromSlug,
  parseCitySlug,
  partitionGuides,
  type GuideArticleItem,
  type GuideCountryGroup,
} from '@/lib/content/hubs'
import { slugToLabel } from '@/lib/routes'

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

function fallbackTitleAndDescription(slug: string, taxonomy?: Taxonomy): GuideSeoDisplay {
  const normalized = slug.replace(/^\//, '')

  if (isCountryGuideSlug(normalized)) {
    const countryKey = getCountryKeyFromSlug(normalized)
    if (countryKey && taxonomy) {
      const display = getCountryDisplayFromTaxonomy(countryKey, taxonomy)
      return {
        title: `${display.name} IVF Guide`,
        description: display.tagline || 'Country guide',
      }
    }
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

function summaryFromListItem(page: ContentListItem, slug: string, taxonomy?: Taxonomy): GuideSeoDisplay | null {
  if (!page.title?.trim()) return null
  const relations = resolvePageRelations(page, taxonomy)
  let description = 'Patient guide'
  if (relations.country && taxonomy) {
    const country = taxonomy.countries.find((c) => c.slug === relations.country)
    if (relations.city) {
      const city = country?.cities.find((c) => c.slug === relations.city)
      description = city?.name ?? relations.city
    } else {
      description = country?.name ? `${country.clinicCount} verified clinics` : 'Country guide'
    }
  }
  return { title: page.title.trim(), description }
}

export async function loadGuideSummaries(
  slugs: string[],
  pagesBySlug?: Map<string, ContentListItem>,
  taxonomy?: Taxonomy,
): Promise<GuideSummaryMap> {
  const unique = [...new Set(slugs.map((s) => s.replace(/^\//, '')))]
  const results = await Promise.all(
    unique.map(async (slug) => {
      const listItem = pagesBySlug?.get(slug)
      const fromList = listItem ? summaryFromListItem(listItem, slug, taxonomy) : null
      if (fromList) return [slug, fromList] as const

      const result = await loadPublishedPage(slug)
      if (result.status === 'ok') {
        return [slug, resolveGuideSeo(result.page, slug)] as const
      }
      return [slug, fallbackTitleAndDescription(slug, taxonomy)] as const
    }),
  )
  return new Map(results)
}

function buildGuideArticleItem(
  page: ContentListItem,
  locale: Locale,
  summaries: GuideSummaryMap,
  taxonomy?: Taxonomy,
): GuideArticleItem | null {
  const slug = page.slug.replace(/^\//, '')
  const href = localizedPath(`/${slug}`, locale)
  const relations = resolvePageRelations(page, taxonomy)
  const seo =
    summaries.get(slug) ??
    summaryFromListItem(page, slug, taxonomy) ??
    fallbackTitleAndDescription(slug, taxonomy)

  if (relations.city && relations.country) {
    const display = taxonomy ? getCountryDisplayFromTaxonomy(relations.country, taxonomy) : null
    const country = taxonomy?.countries.find((c) => c.slug === relations.country)
    const city = country?.cities.find((c) => c.slug === relations.city)
    return {
      slug,
      href,
      title: page.title?.trim() || seo.title,
      description: seo.description || city?.name || '',
      updatedAt: page.updatedAt,
      kind: 'city',
      countryKey: relations.country,
      countryName: display?.name ?? slugToLabel(relations.country),
      flag: display?.flag || flagEmojiForCountry({ slug: relations.country }),
    }
  }

  if (relations.country) {
    const display = taxonomy ? getCountryDisplayFromTaxonomy(relations.country, taxonomy) : null
    return {
      slug,
      href,
      title: page.title?.trim() || seo.title,
      description: seo.description || display?.tagline || '',
      updatedAt: page.updatedAt,
      kind: 'country',
      countryKey: relations.country,
      countryName: display?.name ?? slugToLabel(relations.country),
      flag: display?.flag || flagEmojiForCountry({ slug: relations.country }),
    }
  }

  if (isCountryGuideSlug(slug)) {
    const countryKey = getCountryKeyFromSlug(slug) ?? ''
    const display = taxonomy ? getCountryDisplayFromTaxonomy(countryKey, taxonomy) : null
    return {
      slug,
      href,
      title: seo.title,
      description: seo.description || display?.tagline || '',
      updatedAt: page.updatedAt,
      kind: 'country',
      countryKey,
      countryName: display?.name ?? pageTitleFromSlug(slug),
      flag: display?.flag || flagEmojiForCountry({ slug: countryKey }),
    }
  }

  if (isCityGuideSlug(slug)) {
    const parsed = parseCitySlug(slug)
    if (!parsed) return null
    const display = taxonomy ? getCountryDisplayFromTaxonomy(parsed.countryKey, taxonomy) : null
    return {
      slug,
      href,
      title: seo.title,
      description: seo.description || parsed.countryName,
      updatedAt: page.updatedAt,
      kind: 'city',
      countryKey: parsed.countryKey,
      countryName: parsed.countryName,
      flag: display?.flag || flagEmojiForCountry({ slug: parsed.countryKey }),
    }
  }

  if (page.pageType === 'guide' || slug.startsWith('guides/')) {
    return {
      slug,
      href,
      title: page.title?.trim() || guideTitleForPage(page, relations, taxonomy),
      description: seo.description,
      updatedAt: page.updatedAt,
      kind: 'other',
      countryKey: 'general',
      countryName: 'Guides',
      flag: '🌍',
    }
  }

  return null
}

function countrySortIndex(countryKey: string, taxonomy?: Taxonomy): number {
  if (!taxonomy) return Number.MAX_SAFE_INTEGER
  if (countryKey === 'general') return Number.MAX_SAFE_INTEGER
  const idx = taxonomy.countries.findIndex((c) => c.slug === countryKey)
  return idx === -1 ? taxonomy.countries.length : idx
}

export function buildGuideGroups(
  pages: ContentListItem[],
  summaries: GuideSummaryMap,
  locale: Locale,
  taxonomy?: Taxonomy,
): GuideCountryGroup[] {
  const { countries, cities, uncategorized } = partitionGuides(pages, locale, taxonomy)
  const groupMap = new Map<string, GuideCountryGroup>()

  for (const page of countries) {
    const item = buildGuideArticleItem(page, locale, summaries, taxonomy)
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
    const item = buildGuideArticleItem(page, locale, summaries, taxonomy)
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
      countrySortIndex(a.countryKey, taxonomy) - countrySortIndex(b.countryKey, taxonomy) ||
      a.countryName.localeCompare(b.countryName),
  )

  if (uncategorized.length > 0) {
    const otherItems = uncategorized
      .map((page) => buildGuideArticleItem(page, locale, summaries, taxonomy))
      .filter((item): item is GuideArticleItem => item != null)
    if (otherItems.length > 0) {
      groups.push({
        countryKey: 'general',
        countryName: 'More guides',
        flag: '🌍',
        countryGuide: null,
        cityGuides: otherItems,
      })
    }
  }

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

function pagesMapFromList(pages: ContentListItem[]): Map<string, ContentListItem> {
  return new Map(pages.map((p) => [p.slug.replace(/^\//, ''), p]))
}

export async function loadGuidePostsBySlugs(
  slugs: string[],
  locale: Locale,
  taxonomy?: Taxonomy,
  pages?: ContentListItem[],
): Promise<GuideArticleItem[]> {
  const normalized = [...new Set(slugs.map((s) => s.replace(/^\//, '')))]
  if (normalized.length === 0) return []

  const pageBySlug = pages ? pagesMapFromList(pages) : undefined
  const summaries = await loadGuideSummaries(normalized, pageBySlug, taxonomy)
  const stubPages: ContentListItem[] = normalized.map((slug) =>
    pageBySlug?.get(slug) ?? {
      id: 0,
      slug,
      language: locale,
      updatedAt: '',
    },
  )

  return stubPages
    .map((page) => buildGuideArticleItem(page, locale, summaries, taxonomy))
    .filter((item): item is GuideArticleItem => item != null)
}

export async function loadGuideArticlesBySlugs(
  slugs: string[],
  pages: ContentListItem[],
  locale: Locale,
  taxonomy?: Taxonomy,
): Promise<GuideArticleItem[]> {
  return loadGuidePostsBySlugs(slugs, locale, taxonomy, pages)
}

export async function loadGuideArticlesForEntities(
  entities: PageEntities,
  pages: ContentListItem[],
  locale: Locale,
  taxonomy?: Taxonomy,
  limit = 6,
): Promise<GuideArticleItem[]> {
  const matched = findRelatedGuidePages(entities, pages, { taxonomy, limit })
  if (matched.length === 0) return []

  const pagesBySlug = pagesMapFromList(matched)
  const slugs = matched.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs, pagesBySlug, taxonomy)
  return matched
    .map((page) => buildGuideArticleItem(page, locale, summaries, taxonomy))
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
  taxonomy?: Taxonomy,
): Promise<PublishedPostItem[]> {
  const slugs = pages.map((p) => p.slug.replace(/^\//, ''))
  const pagesBySlug = pagesMapFromList(pages)
  const summaries = await loadGuideSummaries(slugs, pagesBySlug, taxonomy)

  return pages.map((page) => {
    const slug = page.slug.replace(/^\//, '')
    const seo = summaries.get(slug) ?? {
      title: page.title?.trim() || pageTitleFromSlug(slug),
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
  taxonomy?: Taxonomy,
): Promise<GuideCountryGroup[]> {
  const { countries, cities, uncategorized } = partitionGuides(pages, locale, taxonomy)
  const allPages = [...countries, ...cities, ...uncategorized]
  const pagesBySlug = pagesMapFromList(allPages)
  const slugs = allPages.map((p) => p.slug.replace(/^\//, ''))
  const summaries = await loadGuideSummaries(slugs, pagesBySlug, taxonomy)
  return buildGuideGroups(pages, summaries, locale, taxonomy)
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
