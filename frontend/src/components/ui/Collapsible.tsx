'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type CollapsibleProps = {
  /** Label shown on the toggle, e.g. "Google reviews". */
  label: string
  defaultOpen?: boolean
  className?: string
  children: ReactNode
}

/**
 * "Show more" wrapper used to keep secondary content (reviews, long FAQs)
 * out of the initial page flow without removing it.
 */
export function Collapsible({ label, defaultOpen = false, className, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-5 py-3.5 text-left text-sm font-semibold text-[var(--color-primary-900)] transition-colors hover:bg-[var(--color-primary-50)]"
      >
        {label}
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-[var(--color-neutral-400)] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-6">{children}</div>}
    </div>
  )
}
