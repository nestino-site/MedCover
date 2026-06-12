'use client'

import { useMemo } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import type { Taxonomy } from '@/lib/api/types'
import { countryMatchesTreatmentFilter, treatmentsForDisplay } from '@/lib/content/treatments'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { useFilterNavigationOptional } from '@/components/filters/filter-navigation'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'

export function CountriesListView({
  cards,
  locale,
  taxonomy,
}: {
  cards: CountryCardData[]
  locale: Locale
  taxonomy: Taxonomy
}) {
  const t = getDictionary(locale)
  const { treatment, sort } = useHubFilters()
  const { pushParams } = useFilterNavigationOptional()
  const treatmentCategories = treatmentsForDisplay(taxonomy)

  const filtered = useMemo(() => {
    let result = cards.filter((card) =>
      countryMatchesTreatmentFilter(taxonomy, card.countryKey, treatment),
    )

    if (sort === 'cost-asc') {
      result = [...result].sort((a, b) => a.costNumeric - b.costNumeric)
    } else if (sort === 'cost-desc') {
      result = [...result].sort((a, b) => b.costNumeric - a.costNumeric)
    } else if (sort === 'alpha') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'clinics') {
      result = [...result].sort((a, b) => b.clinicsNumeric - a.clinicsNumeric)
    }

    return result
  }, [cards, treatment, sort, taxonomy])

  if (filtered.length === 0) {
    const selectedTreatment = treatmentCategories.find((c) => c.id === treatment)
    const isComingSoon = selectedTreatment?.status === 'coming_soon'

    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] px-6 py-8 text-center">
        <p className="text-sm text-[var(--color-neutral-600)]">
          {isComingSoon
            ? t.hubs.countries.emptyComingSoon.replace(
                '{treatment}',
                selectedTreatment?.name ?? treatment ?? '',
              )
            : t.hubs.countries.emptyFilter}
        </p>
        {treatment && (
          <button
            type="button"
            onClick={() =>
              pushParams((params) => {
                params.delete('treatment')
              })
            }
            className="mt-4 text-sm font-medium text-[var(--color-accent-600)] transition-colors hover:text-[var(--color-accent-700)] hover:underline"
          >
            {t.hubs.countries.clearFilter}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {filtered.map((card) => (
        <CountryCard key={card.slug} data={card} t={t} locale={locale} />
      ))}
    </div>
  )
}
