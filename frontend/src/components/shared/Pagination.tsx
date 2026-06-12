import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

type PaginationProps = {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
  className?: string
}

export function Pagination({ currentPage, totalPages, buildHref, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    currentPage + 2,
  )

  return (
    <nav className={cn('flex items-center justify-center gap-2', className)} aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-neutral-50)]"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium',
            page === currentPage
              ? 'bg-[var(--color-primary-900)] text-white'
              : 'border border-[var(--color-border)] hover:bg-[var(--color-neutral-50)]',
          )}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-neutral-50)]"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
