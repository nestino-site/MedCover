import { Suspense } from 'react'
import { getTaxonomy } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import { buildCityCards } from '@/components/hubs/build-city-cards'
import { CitiesListView } from '@/components/hubs/CitiesListView'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'

export interface CitiesListProps {
  locale: Locale
  /** When set, only cities for this country are shown (e.g. country sub-hub pages). */
  country?: string
}

export async function CitiesList({ locale, country }: CitiesListProps) {
  const t = getDictionary(locale)
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  let items = buildCityCards(pages, locale, taxonomy)
  if (country) {
    items = items.filter((c) => c.countryKey === country)
  }

  if (items.length === 0) {
    return <p className="text-[var(--color-neutral-500)]">{t.hubs.cities.empty}</p>
  }

  return (
    <Suspense fallback={<CitiesListSkeleton />}>
      <CitiesListView items={items} locale={locale} taxonomy={taxonomy} />
    </Suspense>
  )
}

export function CitiesListSkeleton() {
  return (
    <SkeletonStatus label="Loading cities" className="space-y-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7" rounded="full" />
            <Skeleton className="h-5 w-32" rounded="sm" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-14" rounded="lg" />
            ))}
          </div>
        </div>
      ))}
    </SkeletonStatus>
  )
}
