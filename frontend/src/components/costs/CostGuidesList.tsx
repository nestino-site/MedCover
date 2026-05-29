import Link from 'next/link'
import { getContentListSafe } from '@/lib/api/content'
import { treatmentCategories } from '@/lib/content/treatments'
import { countryMeta, slugToLabel } from '@/lib/content/hubs'
import { localizedPath, type Locale } from '@/lib/i18n'

interface ParsedCostSlug {
  countryKey: string
  treatmentId: string
  label: string
}

function parseCostSlug(fullSlug: string): ParsedCostSlug | null {
  const path = fullSlug.replace(/^costs\//, '')
  const treatmentIds = ['ivf', 'dental', 'hair', 'cosmetic']
  for (const treatmentId of treatmentIds) {
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

export interface CostGuidesListProps {
  locale: Locale
  treatment?: string
  country?: string
}

export async function CostGuidesList({ locale, treatment, country }: CostGuidesListProps) {
  const pages = await getContentListSafe()
  let costGuides = pages.filter((p) => p.slug.startsWith('costs/'))

  // Filter by country
  if (country) {
    costGuides = costGuides.filter((p) => {
      const parsed = parseCostSlug(p.slug)
      return parsed?.countryKey === country
    })
  }

  const guidesByTreatment: Record<string, typeof costGuides> = {}
  for (const guide of costGuides) {
    const parsed = parseCostSlug(guide.slug)
    const tid = parsed?.treatmentId ?? 'other'
    guidesByTreatment[tid] = [...(guidesByTreatment[tid] ?? []), guide]
  }

  // Filter visible treatments
  const visibleTreatments = treatment
    ? treatmentCategories.filter((t) => t.id === treatment)
    : treatmentCategories

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
        const guides = guidesByTreatment[t.id] ?? []
        const isActive = t.status === 'active'

        return (
          <div key={t.id} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-[var(--color-primary-950)]">
                {t.name}
              </h3>
              {!isActive && (
                <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-neutral-500)]">
                  Coming soon
                </span>
              )}
            </div>

            {guides.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => {
                  const parsed = parseCostSlug(guide.slug)
                  const countryLookupSlug = parsed
                    ? `guides/${parsed.countryKey}-ivf-guide`
                    : null
                  const meta = countryLookupSlug ? countryMeta[countryLookupSlug] : null
                  const href = localizedPath(`/${guide.slug}`, locale)
                  const label =
                    parsed?.label ?? slugToLabel(guide.slug.replace('costs/', ''))

                  return (
                    <Link
                      key={guide.slug}
                      href={href}
                      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {meta ? (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-2xl leading-none" role="img" aria-label={meta.name}>
                            {meta.flag}
                          </span>
                          <span className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                            {meta.name}
                          </span>
                        </div>
                      ) : null}
                      <p className="text-sm text-[var(--color-neutral-600)]">{label}</p>
                      {meta && (
                        <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
                          Est. {meta.cost}
                        </p>
                      )}
                      <p className="mt-auto pt-4 text-xs font-medium text-[var(--color-accent-600)]">
                        Read full guide →
                      </p>
                    </Link>
                  )
                })}
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

export function CostGuidesListSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-6 w-56 rounded bg-[var(--color-neutral-100)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
    </div>
  )
}
