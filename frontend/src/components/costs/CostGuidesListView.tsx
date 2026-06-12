'use client'

import { Suspense, useMemo } from 'react'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import { localizedPath, type Locale } from '@/lib/i18n'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { CostGuideCard } from '@/components/costs/CostGuideCard'

export interface CostGuideItem {
  slug: string
  countryKey: string
  treatmentId: string
  label: string
  title?: string
  description?: string
  costEstimate?: string
}

export function CostGuidesListView({
  guides,
  locale,
  defaultTreatment,
  treatments,
}: {
  guides: CostGuideItem[]
  locale: Locale
  defaultTreatment?: string
  treatments: TreatmentCategoryDisplay[]
}) {
  return (
    <Suspense fallback={null}>
      <CostGuidesListViewInner
        guides={guides}
        locale={locale}
        defaultTreatment={defaultTreatment}
        treatments={treatments}
      />
    </Suspense>
  )
}

function CostGuidesListViewInner({
  guides,
  locale,
  defaultTreatment,
  treatments,
}: {
  guides: CostGuideItem[]
  locale: Locale
  defaultTreatment?: string
  treatments: TreatmentCategoryDisplay[]
}) {
  const { treatment: treatmentParam, country } = useHubFilters()
  const treatment = treatmentParam ?? defaultTreatment

  const guidesByTreatment = useMemo(() => {
    let filtered = guides
    if (country) {
      filtered = filtered.filter((g) => g.countryKey === country)
    }
    const map: Record<string, CostGuideItem[]> = {}
    for (const guide of filtered) {
      const tid = guide.treatmentId
      map[tid] = [...(map[tid] ?? []), guide]
    }
    return map
  }, [guides, country])

  const visibleTreatments = treatment
    ? treatments.filter((t) => t.id === treatment)
    : treatments

  return (
    <section aria-labelledby="cost-guides-heading">
      <div className="mb-8">
        <h2
          id="cost-guides-heading"
          className="text-2xl font-bold tracking-tight text-[var(--color-primary-950)]"
        >
          Cost guides by treatment
        </h2>
        <p className="mt-2 text-[var(--color-neutral-600)]">
          In-depth cost breakdowns — real patient data, not clinic brochures.
        </p>
      </div>

      {visibleTreatments.map((t) => {
        const sectionGuides = guidesByTreatment[t.id] ?? []
        const isActive = t.status === 'active'

        return (
          <div key={t.id} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-[var(--color-primary-950)]">{t.name}</h3>
              {!isActive && (
                <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-neutral-500)]">
                  Coming soon
                </span>
              )}
            </div>

            {sectionGuides.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sectionGuides.map((guide) => (
                  <CostGuideCard
                    key={guide.slug}
                    href={localizedPath(`/${guide.slug}`, locale)}
                    countryKey={guide.countryKey}
                    label={guide.label}
                    title={guide.title}
                    description={guide.description}
                    costEstimate={guide.costEstimate}
                  />
                ))}
              </div>
            ) : isActive ? (
              <p className="text-sm text-[var(--color-neutral-400)]">
                Cost guides for {t.name} are being published — check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5"
                  >
                    <div className="h-4 w-3/4 rounded bg-[var(--color-neutral-100)]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[var(--color-neutral-100)]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}
