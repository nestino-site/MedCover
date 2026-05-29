import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'compact'
}

export function FilterBar({ children, className, variant = 'default' }: FilterBarProps) {
  const styles =
    variant === 'compact'
      ? 'mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end'
      : 'mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'

  return (
    <section aria-label="Filter and sort options" className={`${styles} ${className ?? ''}`}>
      {children}
    </section>
  )
}
