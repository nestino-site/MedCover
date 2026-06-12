'use client'

import { useMemo } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import type { Taxonomy } from '@/lib/api/types'
import { countryMatchesTreatmentFilter, treatmentsForDisplay } from '@/lib/content/treatments'
import { useHubFilters } from '@/components/filters/use-hub-filters'
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
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        {isComingSoon
          ? t.hubs.countries.emptyComingSoon.replace('{treatment}', selectedTreatment?.name ?? treatment ?? '')
          : t.hubs.countries.emptyFilter}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((card) => (
        <CountryCard key={card.slug} data={card} t={t} />
      ))}
    </div>
  )
}
