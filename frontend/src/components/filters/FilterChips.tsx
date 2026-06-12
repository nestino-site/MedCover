'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useFilterNavigationOptional } from '@/components/filters/filter-navigation'
import { trackFilterApplied } from '@/lib/analytics'

export interface FilterOption {
  value: string
  label: string
  icon?: string
}

interface FilterChipsProps {
  options: FilterOption[]
  paramKey: string
  label?: string
  allLabel?: string
}

export function FilterChips({ options, paramKey, label, allLabel = 'All' }: FilterChipsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, pushParams } = useFilterNavigationOptional()
  const current = searchParams.get(paramKey)

  function select(value: string | null) {
    if (value !== null) trackFilterApplied({ filter_type: paramKey, value })
    pushParams((params) => {
      if (value === null || params.get(paramKey) === value) {
        params.delete(paramKey)
      } else {
        params.set(paramKey, value)
      }
    })
  }

  const chipClass = (active: boolean) =>
    cn(
      'min-h-9 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
      isPending && 'cursor-wait',
      active
        ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-600)] text-white'
        : 'border-[var(--color-border)] bg-white text-[var(--color-neutral-600)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-700)]',
    )

  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => select(null)}
        aria-pressed={current === null}
        aria-busy={isPending && current === null}
        disabled={isPending}
        className={chipClass(current === null)}
      >
        {allLabel}
      </button>
      {options.map((opt) => {
        const isActive = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            aria-pressed={isActive}
            aria-busy={isPending && isActive}
            disabled={isPending}
            className={cn('flex items-center gap-1.5', chipClass(isActive))}
          >
            {opt.icon && (
              <span className="leading-none" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
