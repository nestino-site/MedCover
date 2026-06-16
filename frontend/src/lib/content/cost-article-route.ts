import 'server-only'
import type { ContentListItem } from '@/lib/api/types'
import type { Taxonomy } from '@/lib/api/types'
import { canonicalSlugPath, loadPublishedPage, type PageFetchResult } from '@/lib/api/content'
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'

const COST_ARTICLE_TAIL_RE = /-cost-\d{4}$/

/** Single-segment slug under /cost/ or /costs/ (e.g. hair-restoration-turkey-cost-2026). */
export function isCostTransparencyArticleTail(tail: string): boolean {
  return COST_ARTICLE_TAIL_RE.test(tail)
}

export function isCostTransparencyArticleSlug(slugPath: string): boolean {
  const normalized = canonicalSlugPath(slugPath).replace(/^\//, '')
  const match = normalized.match(/^(cost|costs)\/([^/]+)$/)
  if (!match) return false
  return isCostTransparencyArticleTail(match[2])
}

export function costArticleSlugCandidates(tail: string): string[] {
  const clean = tail.replace(/^\/+|\/+$/g, '')
  return [`/cost/${clean}`, `/costs/${clean}`]
}

export function treatmentSlugsFromTaxonomy(taxonomy: Taxonomy): Set<string> {
  return new Set(taxonomy.treatments.map((t) => canonicalTreatmentSlug(t.slug)))
}

export function isTaxonomyCostTreatment(tail: string, taxonomy: Taxonomy): boolean {
  return treatmentSlugsFromTaxonomy(taxonomy).has(canonicalTreatmentSlug(tail))
}

export async function loadCostTransparencyArticle(
  tail: string,
): Promise<{ slugPath: string; result: Extract<PageFetchResult, { status: 'ok' }> } | null> {
  for (const slugPath of costArticleSlugCandidates(tail)) {
    const result = await loadPublishedPage(slugPath)
    if (result.status === 'ok') {
      return { slugPath, result }
    }
  }
  return null
}

export function costArticleStaticParams(
  pages: ContentListItem[],
  taxonomy: Taxonomy,
): { treatment: string }[] {
  const treatmentSlugs = treatmentSlugsFromTaxonomy(taxonomy)
  const seen = new Set<string>()
  const params: { treatment: string }[] = []

  for (const page of pages) {
    const normalized = canonicalSlugPath(page.slug).replace(/^\//, '')
    const match = normalized.match(/^(cost|costs)\/([^/]+)$/)
    if (!match) continue

    const tail = match[2]
    if (treatmentSlugs.has(canonicalTreatmentSlug(tail))) continue
    if (!isCostTransparencyArticleTail(tail)) continue
    if (seen.has(tail)) continue

    seen.add(tail)
    params.push({ treatment: tail })
  }

  return params
}