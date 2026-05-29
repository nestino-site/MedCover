'use client'

import Link from 'next/link'
import type { TocItem } from '@/lib/api/types'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
}

function TocLinks({ items }: { items: TocItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.anchor}>
          <Link
            href={`#${item.anchor}`}
            className="block border-l-2 border-transparent py-0.5 pl-3 text-sm leading-snug text-[var(--color-neutral-600)] transition-colors hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-800)]"
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const h2Items = items.filter((item) => item.level === 2)
  if (h2Items.length === 0) return null

  return (
    <>
      <details
        className={cn(
          'group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-subtle)] lg:hidden',
          className,
        )}
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--color-primary-950)] [&::-webkit-details-marker]:hidden">
          {en.page.tableOfContents}
        </summary>
        <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-3">
          <TocLinks items={h2Items} />
        </div>
      </details>

      <nav
        aria-label={en.aria.tableOfContents}
        className={cn('hidden lg:block lg:sticky lg:top-24 lg:self-start', className)}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
          {en.page.tableOfContents}
        </p>
        <TocLinks items={h2Items} />
      </nav>
    </>
  )
}
