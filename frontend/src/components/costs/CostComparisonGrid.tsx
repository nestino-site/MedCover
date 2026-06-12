'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { localizedPath, type Locale } from '@/lib/i18n'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'

export interface CostCountryItem {
  countryKey: string
  slug: string
  name: string
  flag: string
  tagline: string
  cost: string
  clinics: string
  href: string
  costNumeric: number
}

export interface CostComparisonGridProps {
  locale: Locale
  countries: CostCountryItem[]
}

export function CostComparisonGrid({ locale, countries }: CostComparisonGridProps) {
  return (
    <Suspense fallback={<CostComparisonGridSkeleton />}>
      <CostComparisonGridInner locale={locale} countries={countries} />
    </Suspense>
  )
}

function CostComparisonGridInner({ locale, countries }: CostComparisonGridProps) {
  const { sort, country } = useHubFilters()

  const items = useMemo(() => {
    let result = countries

    if (country) {
      result = result.filter((c) => c.countryKey === country)
    }

    if (sort === 'alpha') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      result = [...result].sort((a, b) => a.costNumeric - b.costNumeric)
    }

    return result
  }, [countries, country, sort])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <Link
          key={c.slug}
          href={c.href}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-center gap-3 bg-[var(--color-primary-50)] px-5 py-5">
            <span className="text-4xl leading-none" role="img" aria-label={c.name}>
              {c.flag}
            </span>
            <div>
              <p className="font-bold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {c.name}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">{c.tagline}</p>
            </div>
            {i === 0 && sort !== 'alpha' && (
              <span className="ml-auto shrink-0 rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-700)]">
                Lowest
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[var(--color-neutral-400)]">Estimated cost</p>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">{c.cost || '—'}</p>
              </div>
              <span className="text-sm text-[var(--color-neutral-500)]">{c.clinics}</span>
            </div>
            <p className="mt-4 text-xs font-medium text-[var(--color-accent-600)]">
              View destination guide →
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function CostComparisonGridSkeleton() {
  return (
    <SkeletonStatus label="Loading cost comparison">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <Skeleton className="h-24 w-full" rounded="none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-3 w-20" rounded="sm" />
              <Skeleton className="h-8 w-28" rounded="sm" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonStatus>
  )
}

