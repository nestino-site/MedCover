import 'server-only'
import type { ContentListItem } from '@/lib/api/types'
import { canonicalSlugPath } from '@/lib/api/content'
import { localizedPath, type Locale } from '@/lib/i18n'
import {
  countryMeta,
  filterPagesByHub,
  getFeaturedCountries,
  pageTitleFromSlug,
  slugToLabel,
} from '@/lib/content/hubs'
import { findCanonicalCostSlug, parseCostTail } from '@/lib/content/slug-canonical'
import { loadGuideSummaries } from '@/lib/content/guide-display'

const TREATMENT_IDS = ['ivf', 'dental', 'hair', 'cosmetic'] as const

export type CostTreatmentId = (typeof TREATMENT_IDS)[number]

export interface ParsedCostSlug {
  countryKey: string
  treatmentId: CostTreatmentId
  label: string
}

export interface CostArticleItem {
  slug: string
  href: string
  title: string
  description: string
  updatedAt: string
  countryKey: string
  countryName: string
  flag: string
  costEstimate: string
  treatmentId: CostTreatmentId
  label: string
}

export function parseCostSlug(fullSlug: string): ParsedCostSlug | null {
  const path = fullSlug.replace(/^\/?costs\//, '').replace(/^\//, '')
  for (const treatmentId of TREATMENT_IDS) {
    const idx = path.indexOf(`-${treatmentId}-`)
    if (idx !== -1) {
      return {
        countryKey: path.slice(0, idx),
        treatmentId,
        label: slugToLabel(path),
      }
    }
  }
  return null
}

function countryMetaForKey(countryKey: string) {
  return countryMeta[`guides/${countryKey}-ivf-guide`]
}

function isCanonicalCostPage(slug: string, publishedSlugs: string[]): boolean {
  const normalized = slug.replace(/^\//, '')
  const tail = normalized.replace(/^costs\//, '')
  const parsed = parseCostTail(tail)
  if (!parsed) return true

  const canonical = findCanonicalCostSlug(parsed.countryKey, publishedSlugs)
  if (!canonical) return true

  return canonicalSlugPath(canonical) === canonicalSlugPath(`/${normalized}`)
}

export function getPublishedCostPages(
  pages: ContentListItem[],
  locale: Locale,
): ContentListItem[] {
  const publishedSlugs = pages.map((page) => page.slug)
  return filterPagesByHub(pages, 'costs', locale).filter((page) =>
    isCanonicalCostPage(page.slug, publishedSlugs),
  )
}

export function getRelatedCostSlugs(
  currentSlug: string,
  allCostPages: ContentListItem[],
  maxItems = 6,
): string[] {
  const normalized = currentSlug.replace(/^\//, '')
  const parsed = parseCostSlug(normalized)
  const slugs: string[] = []
  const featuredOrder = getFeaturedCountries().map((c) => c.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, ''))

  const pushUnique = (slug: string) => {
    const s = slug.replace(/^\//, '')
    if (s === normalized || slugs.includes(s)) return
    slugs.push(s)
  }

  if (parsed) {
    for (const page of allCostPages) {
      const s = page.slug.replace(/^\//, '')
      const pageParsed = parseCostSlug(s)
      if (pageParsed?.countryKey === parsed.countryKey && pageParsed.treatmentId === parsed.treatmentId) {
        pushUnique(s)
      }
    }

    const sameTreatment = allCostPages
      .map((page) => page.slug.replace(/^\//, ''))
      .filter((s) => {
        const pageParsed = parseCostSlug(s)
        return (
          pageParsed?.treatmentId === parsed.treatmentId &&
          pageParsed.countryKey !== parsed.countryKey
        )
      })
      .sort((a, b) => {
        const aIdx = featuredOrder.indexOf(parseCostSlug(a)?.countryKey ?? '')
        const bIdx = featuredOrder.indexOf(parseCostSlug(b)?.countryKey ?? '')
        const aRank = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx
        const bRank = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx
        return aRank - bRank
      })

    for (const slug of sameTreatment) {
      if (slugs.length >= maxItems) break
      pushUnique(slug)
    }
  }

  if (slugs.length < maxItems) {
    for (const page of allCostPages) {
      if (slugs.length >= maxItems) break
      pushUnique(page.slug)
    }
  }

  return slugs.slice(0, maxItems)
}

function buildCostArticleItem(
  page: ContentListItem,
  locale: Locale,
  summaries: Map<string, { title: string; description: string }>,
): CostArticleItem | null {
  const slug = page.slug.replace(/^\//, '')
  const parsed = parseCostSlug(slug)
  if (!parsed) return null

  const meta = countryMetaForKey(parsed.countryKey)
  const seo = summaries.get(slug)
  const title = seo?.title?.trim() || pageTitleFromSlug(slug)
  const description = seo?.description?.trim() || meta?.tagline || parsed.label

  return {
    slug,
    href: localizedPath(`/${slug}`, locale),
    title,
    description,
    updatedAt: page.updatedAt,
    countryKey: parsed.countryKey,
    countryName: meta?.name ?? slugToLabel(parsed.countryKey),
    flag: meta?.flag ?? '🌍',
    costEstimate: meta?.cost ?? '',
    treatmentId: parsed.treatmentId,
    label: parsed.label,
  }
}

export async function loadCostArticlesBySlugs(
  slugs: string[],
  pages: ContentListItem[],
  locale: Locale,
): Promise<CostArticleItem[]> {
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
      return buildCostArticleItem(page, locale, summaries)
    })
    .filter((item): item is CostArticleItem => item != null)
}

export async function loadRelatedCostArticles(
  currentSlugPath: string,
  locale: Locale,
  pages: ContentListItem[],
  maxItems = 6,
): Promise<CostArticleItem[]> {
  const costPages = getPublishedCostPages(pages, locale)
  const relatedSlugs = getRelatedCostSlugs(currentSlugPath, costPages, maxItems)
  return loadCostArticlesBySlugs(relatedSlugs, pages, locale)
}
