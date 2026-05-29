'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

export interface SortOption {
  value: string
  label: string
}

interface SortSelectProps {
  options: SortOption[]
  defaultValue?: string
  label?: string
}

export function SortSelect({ options, defaultValue, label = 'Sort' }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') ?? defaultValue ?? options[0]?.value

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === (defaultValue ?? options[0]?.value)) {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <label className="flex items-center gap-2">
      <ArrowUpDown size={14} className="shrink-0 text-[var(--color-neutral-400)]" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-white py-1.5 pl-3 pr-8 text-sm text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
