import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <section
      aria-label="Filter and sort options"
      className={`mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className ?? ''}`}
    >
      {children}
    </section>
  )
}
