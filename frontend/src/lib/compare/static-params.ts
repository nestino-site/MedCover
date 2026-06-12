import { canonicalSlugPath } from '@/lib/api/content'
import type { ContentListItem, Taxonomy } from '@/lib/api/types'
import {
  canonicalCompareTail,
  isTreatmentCompareTail,
} from '@/lib/content/slug-canonical'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import {
  compareCityPath,
  compareCountryPath,
  resolveCompareType,
  type CompareType,
} from '@/lib/routes'
import type { Locale } from '@/lib/i18n'

export interface CompareHubItem {
  slug: string
  href: string
  type: CompareType
  treatmentKey?: string
  entityA: string
  entityB: string
  title?: string
}

function stripLeadingSlash(slug: string): string {
  return slug.replace(/^\//, '').replace(/\/+$/, '')
}

function compareTailFromPageSlug(pageSlug: string): string | null {
  const slugPath = canonicalSlugPath(pageSlug)
  if (!slugPath.startsWith('/compare/')) return null

  const rawTail = stripLeadingSlash(slugPath.replace(/^\/compare\//, ''))
  if (!rawTail) return null

  const canonicalTail = canonicalCompareTail(rawTail)
  if (!canonicalTail || !isTreatmentCompareTail(rawTail)) return null

  return canonicalTail
}

export function publishedCompareSlugs(pages: ContentListItem[]): Set<string> {
  const slugs = new Set<string>()
  for (const page of pages) {
    const tail = compareTailFromPageSlug(page.slug)
    if (tail) slugs.add(tail)
  }
  return slugs
}

export function isPublishedCompareSlug(slug: string, pages: ContentListItem[]): boolean {
  const rawTail = stripLeadingSlash(slug.replace(/^compare\//, ''))
  const canonicalTail = canonicalCompareTail(rawTail)
  if (!canonicalTail || !isTreatmentCompareTail(rawTail)) return false
  return publishedCompareSlugs(pages).has(canonicalTail)
}

function hubItemFromCompareTail(
  canonicalTail: string,
  taxonomy: Taxonomy,
  locale: Locale,
  title?: string,
): CompareHubItem | null {
  const forMatch = canonicalTail.match(/^(.+)-vs-(.+)-for-(.+)$/)
  if (!forMatch) return null

  const [, entityA, entityB, treatmentRaw] = forMatch
  const treatmentKey = canonicalTreatmentSlug(treatmentRaw)
  const type = resolveCompareType(entityA, entityB, true, taxonomy)
  if (!type || type === 'clinic') return null

  const href =
    type === 'country'
      ? compareCountryPath(entityA, entityB, treatmentKey, locale)
      : compareCityPath(entityA, entityB, treatmentKey, locale)

  return {
    slug: canonicalTail,
    href,
    type,
    treatmentKey,
    entityA,
    entityB,
    title,
  }
}

export function buildCompareHubItemsFromPages(
  pages: ContentListItem[],
  taxonomy: Taxonomy,
  locale: Locale,
): CompareHubItem[] {
  const seen = new Set<string>()
  const items: CompareHubItem[] = []

  for (const page of pages) {
    const canonicalTail = compareTailFromPageSlug(page.slug)
    if (!canonicalTail || seen.has(canonicalTail)) continue

    const item = hubItemFromCompareTail(canonicalTail, taxonomy, locale, page.title)
    if (!item) continue

    seen.add(canonicalTail)
    items.push(item)
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

export function generateCompareStaticParams(pages: ContentListItem[]): { slug: string }[] {
  const slugs = [...publishedCompareSlugs(pages)]
  return slugs.sort().map((slug) => ({ slug }))
}

export function compareSlugType(slug: string, taxonomy: Taxonomy): CompareType {
  const forMatch = slug.match(/^(.+)-vs-(.+)-for-(.+)$/)
  if (!forMatch) return 'clinic'
  const [, rawA, rawB] = forMatch
  const type = resolveCompareType(rawA, rawB, true, taxonomy)
  return type ?? 'city'
}
