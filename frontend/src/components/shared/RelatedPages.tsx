import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { TocItem } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface RelatedPagesProps {
  toc: TocItem[]
  maxItems?: number
}

export function RelatedPages({ toc, maxItems = 6 }: RelatedPagesProps) {
  const h2Items = toc.filter((item) => item.level === 2).slice(0, maxItems)
  if (h2Items.length === 0) return null

  return (
    <nav aria-label={en.page.relatedPages} className="my-8">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary-950)]">
        {en.page.relatedPages}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {h2Items.map((item) => (
          <li key={item.anchor}>
            <Link
              href={`#${item.anchor}`}
              className="group flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-neutral-700)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] transition-colors"
            >
              <ArrowRight
                size={14}
                className="shrink-0 text-[var(--color-neutral-400)] group-hover:text-[var(--color-primary-500)] transition-colors"
                aria-hidden="true"
              />
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
