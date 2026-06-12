'use client'

import { useCallback, useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
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
import { canonicalTreatmentSlug } from '@/lib/content/treatment-slugs'
import { useClinicFilterNavigationOptional } from '@/components/clinics/clinic-filter-navigation'

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
  const filterCountry =
    scope.kind === 'country' ||
    scope.kind === 'city' ||
    scope.kind === 'country_treatment' ||
    scope.kind === 'city_treatment'
      ? scope.country
      : undefined

  const seen = new Set<string>()
  const treatments = []

  for (const treatment of taxonomy.treatments) {
    if (filterCountry && !treatment.countries.includes(filterCountry)) continue
    const slug = canonicalTreatmentSlug(treatment.slug)
    if (seen.has(slug)) continue
    seen.add(slug)
    treatments.push({ ...treatment, slug })
  }

  return treatments
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
  const { isPending, navigate } = useClinicFilterNavigationOptional()

  const treatments = scopeTreatments(taxonomy, scope)
  const cities = scopeCities(taxonomy, scope)
  const activeTreatment = currentTreatment(scope)
  const activeCity = currentCity(scope)

  const querySuffix = buildPlpQueryString(
    { pageNum: 1, sort, minRating, minTruthScore },
    1,
  )

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
      navigate(`${basePath}${qs}`, true)
    },
    [basePath, minRating, minTruthScore, navigate, sort],
  )

  const navigateTreatment = (treatmentSlug: string) => {
    if (!treatmentSlug) {
      if (scope.kind === 'country_treatment') {
        navigate(`${clinicCountryPath(scope.country, locale)}${querySuffix}`)
      } else if (scope.kind === 'city_treatment') {
        navigate(`${clinicCityPath(scope.country, scope.city, locale)}${querySuffix}`)
      }
      return
    }

    if (scope.kind === 'country' || scope.kind === 'country_treatment') {
      navigate(`${clinicCountryTreatmentPath(scope.country, treatmentSlug, locale)}${querySuffix}`)
    } else if (scope.kind === 'city' || scope.kind === 'city_treatment') {
      navigate(
        `${clinicCityTreatmentPath(scope.country, scope.city, treatmentSlug, locale)}${querySuffix}`,
      )
    }
  }

  const navigateCity = (citySlug: string) => {
    if (!citySlug || (scope.kind !== 'country' && scope.kind !== 'country_treatment')) return
    navigate(`${clinicCityPath(scope.country, citySlug, locale)}${querySuffix}`)
  }

  const activePills: { label: string; onClear: () => void }[] = []

  if (activeTreatment) {
    const t = treatments.find(
      (x) => x.slug === activeTreatment || canonicalTreatmentSlug(x.slug) === activeTreatment,
    )
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

  const filterDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const syncOpenState = () => {
      if (filterDetailsRef.current) {
        filterDetailsRef.current.open = mq.matches
      }
    }
    syncOpenState()
    mq.addEventListener('change', syncOpenState)
    return () => mq.removeEventListener('change', syncOpenState)
  }, [])

  const selectClassName =
    'w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-primary-900)] disabled:cursor-wait disabled:opacity-60 sm:min-w-[120px] md:min-w-[160px]'

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-primary-900)]">
          {total} clinic{total === 1 ? '' : 's'} found
        </p>
      </div>

      <details ref={filterDetailsRef} className="group">
        <summary className="mb-3 flex cursor-pointer list-none items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-neutral-50)] px-3 py-2.5 text-sm font-medium text-[var(--color-primary-900)] md:hidden [&::-webkit-details-marker]:hidden">
          <span>Filters & sort</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        {showTreatmentFilter && (
          <label className="flex w-full flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)] md:w-auto">
            Treatment
            <select
              value={activeTreatment ?? ''}
              onChange={(e) => navigateTreatment(e.target.value)}
              disabled={isPending}
              aria-busy={isPending}
              className={selectClassName}
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
          <label className="flex w-full flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)] md:w-auto">
            City
            <select
              value={activeCity ?? ''}
              onChange={(e) => navigateCity(e.target.value)}
              disabled={isPending}
              aria-busy={isPending}
              className={selectClassName}
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

        <label className="flex w-full flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)] md:w-auto">
          Sort by
          <select
            value={sort}
            onChange={(e) => applyQueryFilters({ sort: e.target.value as ClinicSort })}
            disabled={isPending}
            aria-busy={isPending}
            className={selectClassName}
          >
            {CLINIC_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex w-full flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)] md:w-auto">
          Min rating
          <select
            value={minRating ?? ''}
            onChange={(e) =>
              applyQueryFilters({
                minRating: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            disabled={isPending}
            aria-busy={isPending}
            className={selectClassName}
          >
            <option value="">Any</option>
            <option value="3">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <label className="flex w-full flex-col gap-1 text-xs font-medium text-[var(--color-neutral-500)] md:w-auto">
          Min Truth Score
          <select
            value={minTruthScore ?? ''}
            onChange={(e) =>
              applyQueryFilters({
                minTruthScore: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
            disabled={isPending}
            aria-busy={isPending}
            className={selectClassName}
          >
            <option value="">Any</option>
            <option value="60">60+</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </label>
      </div>
      </details>

      {activePills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activePills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={pill.onClear}
              disabled={isPending}
              aria-busy={isPending}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-medium text-[var(--color-primary-800)] hover:bg-[var(--color-primary-100)] disabled:cursor-wait disabled:opacity-60"
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
