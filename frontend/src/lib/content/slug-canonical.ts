import type { ContentListItem } from '@/lib/api/types'
import { canonicalSlugPath } from '@/lib/api/content'
import { canonicalPair } from '@/lib/routes'

const REDIRECTED_STUB_PATTERNS = [
  /^\/for-clinics\/?$/,
  /^\/for-clinics\/pricing\/?$/,
  /^\/truth-score\/?$/,
  /^\/ai-interviewer\/?$/,
]

const COST_TAIL_RE = /^([^/]+)-ivf-cost-(\d{4})$/
const COMPARE_LEGACY_TAIL_RE = /^(.+)-vs-(.+)-ivf$/
const COMPARE_FOR_TAIL_RE = /^(.+)-vs-(.+)-for-(.+)$/
const COMPARE_CLINIC_TAIL_RE = /^(.+)-vs-(.+)$/

function stripLeadingSlash(slug: string): string {
  return slug.replace(/^\//, '').replace(/\/+$/, '')
}

export function isRedirectedStubSlug(slugPath: string): boolean {
  const normalized = canonicalSlugPath(slugPath)
  return REDIRECTED_STUB_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function parseCostTail(tail: string): { countryKey: string; year: number } | null {
  const match = stripLeadingSlash(tail).match(COST_TAIL_RE)
  if (!match) return null
  return { countryKey: match[1], year: Number.parseInt(match[2], 10) }
}

export function findCanonicalCostSlug(
  countryKey: string,
  publishedSlugs: string[],
): string | null {
  const prefix = `costs/${countryKey}-ivf-cost-`
  const matches = publishedSlugs
    .map((slug) => stripLeadingSlash(slug))
    .filter((slug) => slug.startsWith(prefix))

  if (matches.length === 0) return null

  const best = matches.sort((a, b) => {
    const yearA = parseCostTail(a)?.year ?? 0
    const yearB = parseCostTail(b)?.year ?? 0
    return yearB - yearA
  })[0]

  return canonicalSlugPath(`/${best}`)
}

export function resolveCostCanonicalSlug(
  slugPath: string,
  pages: ContentListItem[],
): string | null {
  const normalized = canonicalSlugPath(slugPath)
  if (!normalized.startsWith('/costs/')) return null

  const tail = stripLeadingSlash(normalized.replace(/^\/costs\//, ''))
  const parsed = parseCostTail(tail)
  if (!parsed) return null

  const publishedSlugs = pages.map((page) => page.slug)
  const canonical = findCanonicalCostSlug(parsed.countryKey, publishedSlugs)
  if (!canonical || canonical === normalized) return null

  return canonical
}

function canonicalCompareTail(tail: string): string | null {
  const forMatch = tail.match(COMPARE_FOR_TAIL_RE)
  if (forMatch) {
    const [, rawA, rawB, treatment] = forMatch
    const [a, b] = canonicalPair(rawA, rawB)
    return `${a}-vs-${b}-for-${treatment}`
  }

  const legacyMatch = tail.match(COMPARE_LEGACY_TAIL_RE)
  if (legacyMatch) {
    const [, rawA, rawB] = legacyMatch
    const [a, b] = canonicalPair(rawA, rawB)
    return `${a}-vs-${b}-for-ivf`
  }

  const clinicMatch = tail.match(COMPARE_CLINIC_TAIL_RE)
  if (clinicMatch) {
    const [, rawA, rawB] = clinicMatch
    const [a, b] = canonicalPair(rawA, rawB)
    return `${a}-vs-${b}`
  }

  return null
}

export function resolveCompareCanonicalSlug(
  slugPath: string,
  pages: ContentListItem[],
): string | null {
  const normalized = canonicalSlugPath(slugPath)
  if (!normalized.startsWith('/compare/')) return null

  const tail = stripLeadingSlash(normalized.replace(/^\/compare\//, ''))
  const canonicalTail = canonicalCompareTail(tail)
  if (!canonicalTail || canonicalTail === tail) return null

  const canonical = canonicalSlugPath(`/compare/${canonicalTail}`)
  if (canonical === normalized) return null

  const published = new Set(pages.map((page) => canonicalSlugPath(page.slug)))
  if (!published.has(canonical)) return null

  return canonical
}

export function isCanonicalCompareSlug(slugPath: string): boolean {
  const normalized = canonicalSlugPath(slugPath)
  if (!normalized.startsWith('/compare/')) return true

  const tail = stripLeadingSlash(normalized.replace(/^\/compare\//, ''))
  const canonicalTail = canonicalCompareTail(tail)
  return canonicalTail === tail
}

export function isCanonicalCostSlug(
  slugPath: string,
  publishedSlugs: string[],
): boolean {
  const normalized = canonicalSlugPath(slugPath)
  if (!normalized.startsWith('/costs/')) return true

  const tail = stripLeadingSlash(normalized.replace(/^\/costs\//, ''))
  const parsed = parseCostTail(tail)
  if (!parsed) return true

  const canonical = findCanonicalCostSlug(parsed.countryKey, publishedSlugs)
  return canonical === normalized
}

export function filterSitemapPublishedPages(
  pages: ContentListItem[],
): ContentListItem[] {
  const publishedSlugs = pages.map((page) => page.slug)

  return pages.filter((page) => {
    const slugPath = canonicalSlugPath(page.slug)

    if (isRedirectedStubSlug(slugPath)) return false
    if (!isCanonicalCostSlug(slugPath, publishedSlugs)) return false
    if (!isCanonicalCompareSlug(slugPath)) return false

    return true
  })
}
