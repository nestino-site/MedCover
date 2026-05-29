'use client'

import { useMemo } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'
import { treatmentCategories } from '@/lib/content/treatments'
import { useHubFilters } from '@/components/filters/use-hub-filters'
import { CountryCard, type CountryCardData } from '@/components/hubs/CountryCard'

export function CountriesListView({
  cards,
  locale,
}: {
  cards: CountryCardData[]
  locale: Locale
}) {
  const t = getDictionary(locale)
  const { treatment, sort } = useHubFilters()
  const activeTreatment = treatmentCategories.find((c) => c.status === 'active')

  const filtered = useMemo(() => {
    let result = cards

    if (treatment && treatment !== activeTreatment?.id) {
      result = []
    }

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
  }, [cards, treatment, sort, activeTreatment?.id])

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-[var(--color-neutral-500)]">
        No countries found for the selected filter.
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
