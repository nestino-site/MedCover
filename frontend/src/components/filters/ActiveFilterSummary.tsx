'use client'

import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useFilterNavigationOptional } from '@/components/filters/filter-navigation'

interface FilterDef {
  paramKey: string
  label: (value: string) => string
}

interface ActiveFilterSummaryProps {
  filters: FilterDef[]
  total: number
  filteredTotal: number
  itemLabel?: string
}

export function ActiveFilterSummary({
  filters,
  total,
  filteredTotal,
  itemLabel = 'results',
}: ActiveFilterSummaryProps) {
  const searchParams = useSearchParams()
  const { isPending, pushParams } = useFilterNavigationOptional()

  const activeFilters = filters
    .map((f) => {
      const value = searchParams.get(f.paramKey)
      if (!value) return null
      return { paramKey: f.paramKey, value, display: f.label(value) }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null)

  if (activeFilters.length === 0) return null

  function remove(paramKey: string) {
    pushParams((params) => {
      params.delete(paramKey)
    })
  }

  function clearAll() {
    pushParams((params) => {
      for (const key of [...params.keys()]) {
        params.delete(key)
      }
    })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={isPending}
    >
      <span className="text-sm text-[var(--color-neutral-500)]">
        {filteredTotal === total
          ? `${total} ${itemLabel}`
          : `${filteredTotal} of ${total} ${itemLabel}`}
      </span>
      {activeFilters.map((f) => (
        <button
          key={f.paramKey}
          type="button"
          onClick={() => remove(f.paramKey)}
          disabled={isPending}
          aria-busy={isPending}
          className="flex items-center gap-1 rounded-full bg-[var(--color-primary-100)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-200)] disabled:cursor-wait disabled:opacity-60"
        >
          {f.display}
          <X size={10} aria-hidden="true" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          disabled={isPending}
          aria-busy={isPending}
          className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)] underline disabled:cursor-wait disabled:opacity-60"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
