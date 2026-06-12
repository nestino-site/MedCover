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
import { CardGridSkeleton, GuidePostCardSkeleton } from '@/components/ui/skeletons'
import { Skeleton, SkeletonStatus, SkeletonText } from '@/components/ui/Skeleton'

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
    <SkeletonStatus label="Loading cost guides">
      <Skeleton className="mb-4 h-6 w-56" rounded="md" />
      <SkeletonText lines={1} className="mb-8 max-w-lg" widths={['w-full']} />
      <CardGridSkeleton count={3}>
        <GuidePostCardSkeleton variant="compact" />
      </CardGridSkeleton>
    </SkeletonStatus>
  )
}
