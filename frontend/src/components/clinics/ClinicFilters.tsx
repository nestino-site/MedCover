'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { X } from 'lucide-react'
import type { Taxonomy } from '@/lib/api/types'
import {
  clinicCityPath,
  clinicCityTreatmentPath,
  clinicCountryPath,
  clinicCountryTreatmentPath,
} from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import {
  CLINIC_SORT_OPTIONS,
  buildPlpQueryString,
  type ClinicSort,
} from '@/lib/clinics/plp-search-params'
import { cn } from '@/lib/utils/cn'

export type ClinicPlpScope =
  | { kind: 'hub' }
  | { kind: 'country'; country: string }
  | { kind: 'city'; country: string; city: string }
  | { kind: 'country_treatment'; country: string; treatment: string }
  | { kind: 'city_treatment'; country: string; city: string; treatment: string }

type ClinicFiltersProps = {
  taxonomy: Taxonomy
  scope: ClinicPlpScope
  locale?: Locale
  total: number
  sort: ClinicSort
  minRating?: number
  minTruthScore?: number
  basePath: string
}

function scopeTreatments(taxonomy: Taxonomy, scope: ClinicPlpScope) {
  if (scope.kind === 'country' || scope.kind === 'city') {
    return taxonomy.treatments.filter((t) => t.countries.includes(scope.country))
  }
  if (scope.kind === 'country_treatment' || scope.kind === 'city_treatment') {
    return taxonomy.treatments.filter((t) => t.countries.includes(scope.country))
  }
  return taxonomy.treatments
}

function scopeCities(taxonomy: Taxonomy, scope: ClinicPlpScope) {
  if (scope.kind === 'country' || scope.kind === 'country_treatment') {
    return taxonomy.countries.find((c) => c.slug === scope.country)?.cities ?? []
  }
  return []
}

function currentTreatment(scope: ClinicPlpScope): string | undefined {
  if (scope.kind === 'country_treatment' || scope.kind === 'city_treatment') {
    return scope.treatment
  }
  return undefined
}

function currentCity(scope: ClinicPlpScope): string | undefined {
  if (scope.kind === 'city' || scope.kind === 'city_treatment') {
    return scope.city
  }
  return undefined
}

export function ClinicFilters({
  taxonomy,
  scope,
  locale = 'en',
  total,
  sort,
  minRating,
  minTruthScore,
  basePath,
}: ClinicFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const treatments = scopeTreatments(taxonomy, scope)
  const cities = scopeCities(taxonomy, scope)
  const activeTreatment = currentTreatment(scope)
  const activeCity = currentCity(scope)

  const applyQueryFilters = useCallback(
    (updates: { sort?: ClinicSort; minRating?: number | null; minTruthScore?: number | null }) => {
      const nextSort = updates.sort ?? sort
      const nextMinRating = updates.minRating !== undefined ? updates.minRating ?? undefined : minRating
      const nextMinTruthScore =
        updates.minTruthScore !== undefined ? updates.minTruthScore ?? undefined : minTruthScore

      const qs = buildPlpQueryString(
        { pageNum: 1, sort: nextSort, minRating: nextMinRating, minTruthScore: nextMinTruthScore },
        1,
      )
      startTransition(() => {
        router.replace(`${basePath}${qs}`)
      })
    },
    [basePath, minRating, minTruthScore, router, sort],
  )

  const navigateTreatment = (treatmentSlug: string) => {
    if (!treatmentSlug) {
      if (scope.kind === 'country_treatment') {
        router.push(`${clinicCountryPath(scope.country, locale)}${buildPlpQueryString({ pageNum: 1, sort, minRating, minTruthScore }, 1)}`)
      } else if (scope.kind === 'city_treatment') {
        router.push(`${clinicCityPath(scope.country, scope.city, locale)}${buildPlpQueryString({ pageNum: 1, sort, minRating, minTruthScore }, 1)}`)
      }
      return
    }

    if (scope.kind === 'country' || scope.kind === 'country_treatment') {
      router.push(
        `${clinicCountryTreatmentPath(scope.country, treatmentSlug, locale)}${buildPlpQueryString({ pageNum: 1, sort, minRating, minTruthScore }, 1)}`,
      )
    } else if (scope.kind === 'city' || scope.kind === 'city_treatment') {
      router.push(
        `${clinicCityTreatmentPath(scope.country, scope.city, treatmentSlug, locale)}${buildPlpQueryString({ pageNum: 1, sort, minRating, minTruthScore }, 1)}`,
      )
    }
  }

  const navigateCity = (citySlug: string) => {
    if (!citySlug || scope.kind !== 'country' && scope.kind !== 'country_treatment') return
    router.push(
      `${clinicCityPath(scope.country, citySlug, locale)}${buildPlpQueryString({ pageNum: 1, sort, minRating, minTruthScore }, 1)}`,
    )
  }

  const activePills: { label: string; onClear: () => void }[] = []

  if (activeTreatment) {
    const t = taxonomy.treatments.find((x) => x.slug === activeTreatment)
    activePills.push({
      label: t?.name ?? activeTreatment,
      onClear: () => navigateTreatment(''),
    })
  }

  if (minRating != null) {
    activePills.push({
      label: `Rating ≥ ${minRating}`,
      onClear: () => applyQueryFilters({ minRating: null }),
    })
  }

  if (minTruthScore != null) {
    activePills.push({
      label: `Truth Score ≥ ${minTruthScore}`,
      onClear: () => applyQueryFilters({ minTruthScore: null }),
    })
  }

  if (sort !== 'rating') {
    const sortLabel = CLINIC_SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort
    activePills.push({
      label: `Sort: ${sortLabel}`,
      onClear: () => applyQueryFilters({ sort: 'rating' }),
    })
  }

  const showTreatmentFilter =
    scope.kind === 'country' ||
    scope.kind === 'city' ||
    scope.kind === 'country_treatment' ||
    scope.kind === 'city_treatment'

  const showCityFilter = scope.kind === 'country' || scope.kind === 'country_treatment'

  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm',
        isPending && 'opacity-70',
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-primary-900)]">
          {total} clinic{total === 1 ? '' : 's'} found
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {showTreatmentFilter && (
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)]">
            Treatment
            <select
              value={activeTreatment ?? ''}
              onChange={(e) => navigateTreatment(e.target.value)}
              className="min-w-[160px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary-900)]"
            >
              <option value="">All treatments</option>
              {treatments.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {showCityFilter && cities.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)]">
            City
            <select
              value={activeCity ?? ''}
              onChange={(e) => navigateCity(e.target.value)}
              className="min-w-[160px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary-900)]"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.clinicCount})
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)]">
          Sort by
          <select
            value={sort}
            onChange={(e) => applyQueryFilters({ sort: e.target.value as ClinicSort })}
            className="min-w-[160px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary-900)]"
          >
            {CLINIC_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)]">
          Min rating
          <select
            value={minRating ?? ''}
            onChange={(e) =>
              applyQueryFilters({
                minRating: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="min-w-[120px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary-900)]"
          >
            <option value="">Any</option>
            <option value="3">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)]">
          Min Truth Score
          <select
            value={minTruthScore ?? ''}
            onChange={(e) =>
              applyQueryFilters({
                minTruthScore: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            className="min-w-[120px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary-900)]"
          >
            <option value="">Any</option>
            <option value="60">60+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </label>
      </div>

      {activePills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activePills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={pill.onClear}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)]"
            >
              {pill.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
