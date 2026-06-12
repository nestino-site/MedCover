'use client'

import Link from 'next/link'
import type { TocItem } from '@/lib/api/types'
import { ListTree } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
  variant?: 'default' | 'card'
}

function TocLinks({ items, numbered }: { items: TocItem[]; numbered?: boolean }) {
  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={item.anchor}>
          <Link
            href={`#${item.anchor}`}
            className="group flex items-start gap-2 rounded-lg py-1.5 pl-2 pr-2 text-sm leading-snug text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)]/60 hover:text-[var(--color-primary-800)]"
          >
            {numbered && (
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-100)] text-[10px] font-bold text-[var(--color-primary-700)] transition-colors group-hover:bg-[var(--color-primary-200)]"
                aria-hidden="true"
              >
                {index + 1}
              </span>
            )}
            <span className={cn(!numbered && 'border-l-2 border-transparent pl-3 group-hover:border-[var(--color-primary-300)]')}>
              {item.text}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function TableOfContents({ items, className, variant = 'default' }: TableOfContentsProps) {
  const h2Items = items.filter((item) => item.level === 2)
  if (h2Items.length === 0) return null

  const isCard = variant === 'card'

  return (
    <>
      <details
        className={cn(
          'group rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-xs)] lg:hidden',
          className,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 text-sm font-semibold text-[var(--color-primary-950)] [&::-webkit-details-marker]:hidden">
          <ListTree size={16} className="text-[var(--color-accent-600)]" aria-hidden="true" />
          {en.page.tableOfContents}
          <span className="ml-auto text-xs font-normal text-[var(--color-neutral-400)]">
            {h2Items.length} sections
          </span>
        </summary>
        <div className="border-t border-[var(--color-border)] px-3 pb-4 pt-3">
          <TocLinks items={h2Items} numbered={isCard} />
        </div>
      </details>

      <nav
        aria-label={en.aria.tableOfContents}
        className={cn(
          'hidden lg:block lg:sticky lg:top-24 lg:self-start',
          isCard &&
            'rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]',
          className,
        )}
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
            <ListTree size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
              {en.page.tableOfContents}
            </p>
            <p className="text-[11px] text-[var(--color-neutral-400)]">
              {h2Items.length} sections
            </p>
          </div>
        </div>
        <TocLinks items={h2Items} numbered={isCard} />
      </nav>
    </>
  )
}
