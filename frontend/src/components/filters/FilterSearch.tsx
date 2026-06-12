'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useFilterNavigationOptional } from '@/components/filters/filter-navigation'

interface FilterSearchProps {
  paramKey?: string
  placeholder?: string
  label?: string
}

export function FilterSearch({
  paramKey = 'q',
  placeholder = 'Search…',
  label = 'Search',
}: FilterSearchProps) {
  const searchParams = useSearchParams()
  const { isPending, pushParams } = useFilterNavigationOptional()
  const urlValue = searchParams.get(paramKey) ?? ''
  const [value, setValue] = useState(urlValue)

  useEffect(() => {
    setValue(urlValue)
  }, [urlValue])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = value.trim()
      if (trimmed === urlValue) return
      pushParams((params) => {
        if (trimmed) {
          params.set(paramKey, trimmed)
        } else {
          params.delete(paramKey)
        }
      })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [value, urlValue, paramKey, pushParams])

  return (
    <label className="relative flex min-w-0 flex-1 items-center sm:max-w-xs">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 text-[var(--color-neutral-400)]"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={label}
        className="w-full rounded-lg border border-[var(--color-border)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--color-neutral-700)] transition-colors placeholder:text-[var(--color-neutral-400)] hover:border-[var(--color-primary-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] disabled:cursor-wait disabled:opacity-60"
      />
    </label>
  )
}
