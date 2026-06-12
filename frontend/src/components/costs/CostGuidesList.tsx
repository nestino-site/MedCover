import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { getContentListSafe } from '@/lib/api/content'
import {
  getPublishedCostPages,
  loadCostArticlesBySlugs,
  parseCostSlug,
} from '@/lib/content/cost-display'
import { treatmentsForDisplay } from '@/lib/content/treatments'
import type { Locale } from '@/lib/i18n'
import {
  CostGuidesListView,
  type CostGuideItem,
} from '@/components/costs/CostGuidesListView'

export interface CostGuidesListProps {
  locale: Locale
  /** When the route already scopes to one treatment (e.g. /treatments/ivf/costs). */
  defaultTreatment?: string
}

export async function CostGuidesList({ locale, defaultTreatment }: CostGuidesListProps) {
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), getContentListSafe()])
  const costPages = getPublishedCostPages(pages, locale)
  const slugs = costPages.map((g) => g.slug.replace(/^\//, ''))
  const articleItems = await loadCostArticlesBySlugs(slugs, pages, locale, taxonomy)
  const articleBySlug = new Map(articleItems.map((item) => [item.slug, item]))

  const guides = costPages.flatMap((page): CostGuideItem[] => {
    const slug = page.slug.replace(/^\//, '')
    const parsed = parseCostSlug(slug)
    const article = articleBySlug.get(slug)
    if (!parsed) return []
    return [
      {
        slug,
        countryKey: parsed.countryKey,
        treatmentId: parsed.treatmentId,
        label: parsed.label,
        title: article?.title,
        description: article?.description,
        costEstimate: article?.costEstimate,
      },
    ]
  })

  return (
    <Suspense fallback={<CostGuidesListSkeleton />}>
      <CostGuidesListView
        guides={guides}
        locale={locale}
        defaultTreatment={defaultTreatment}
        treatments={treatmentsForDisplay(taxonomy)}
      />
    </Suspense>
  )
}

export function CostGuidesListSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading cost guides">
      <div className="mb-4 h-6 w-56 rounded bg-[var(--color-neutral-100)]" />
      <div className="mb-8 h-4 w-full max-w-lg rounded bg-[var(--color-neutral-100)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl border border-[var(--color-border)] bg-white p-4">
            <div className="mb-3 flex gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--color-neutral-100)]" />
              <div className="h-4 w-24 rounded bg-[var(--color-neutral-100)]" />
            </div>
            <div className="h-3 w-full rounded bg-[var(--color-neutral-100)]" />
            <div className="mt-4 h-3 w-16 rounded bg-[var(--color-neutral-100)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
