import { canonicalSlugPath } from '@/lib/api/content'
import type { ContentListItem, Taxonomy } from '@/lib/api/types'
import {
  compareCityPath,
  compareCountryPath,
  compareDetailPath,
  canonicalCompareTail,
  parseCompareSlug,
  resolveCompareCanonicalSlug,
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
  if (!canonicalTail) return null
  const parsed = parseCompareSlug(canonicalTail)
  if (!parsed?.treatment) return null

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
  if (!canonicalTail) return false
  const parsed = parseCompareSlug(canonicalTail)
  if (!parsed?.treatment) return false
  return publishedCompareSlugs(pages).has(canonicalTail)
}

function hubItemFromCompareTail(
  canonicalTail: string,
  taxonomy: Taxonomy,
  locale: Locale,
  title?: string,
): CompareHubItem | null {
  const parsed = resolveCompareCanonicalSlug(canonicalTail, taxonomy)
  if (!parsed || parsed.type === 'clinic' || !parsed.treatment) return null

  const href =
    parsed.type === 'country'
      ? compareCountryPath(parsed.entityA, parsed.entityB, parsed.treatment, locale)
      : compareCityPath(parsed.entityA, parsed.entityB, parsed.treatment, locale)

  return {
    slug: parsed.canonicalSlug,
    href,
    type: parsed.type,
    treatmentKey: parsed.treatment,
    entityA: parsed.entityA,
    entityB: parsed.entityB,
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
  const parsed = parseCompareSlug(slug)
  if (!parsed?.treatment) return 'clinic'
  const type = resolveCompareType(parsed.entityA, parsed.entityB, true, taxonomy)
  return type ?? 'city'
}

/** Canonical public path for a CMS compare page slug. */
export function comparePublicPathFromPageSlug(
  pageSlug: string,
  taxonomy: Taxonomy,
  locale: Locale,
): string | null {
  const canonicalTail = compareTailFromPageSlug(pageSlug)
  if (!canonicalTail) return null
  const parsed = resolveCompareCanonicalSlug(canonicalTail, taxonomy)
  if (!parsed || parsed.type === 'clinic') return null
  return compareDetailPath(parsed.canonicalSlug, locale)
}
