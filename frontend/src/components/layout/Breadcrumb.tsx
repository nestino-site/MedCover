import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbItem } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  homeHref?: string
}

export function Breadcrumb({ items, homeHref = '/' }: BreadcrumbProps) {
  const sorted = [...items].sort((a, b) => a.position - b.position)

  const allItems = [
    { name: en.breadcrumb.home, slug: homeHref },
    ...sorted,
  ]

  return (
    <nav aria-label={en.aria.breadcrumbNavigation} className="py-3">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--color-neutral-500)]">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={item.slug} className="flex items-center gap-1">
              {index === 0 ? (
                <Home size={13} className="shrink-0" aria-hidden="true" />
              ) : (
                <ChevronRight size={13} className="shrink-0 text-[var(--color-neutral-300)]" aria-hidden="true" />
              )}

              {isLast ? (
                <span className="font-medium text-[var(--color-neutral-700)]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.slug}
                  className="hover:text-[var(--color-primary-700)] transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
