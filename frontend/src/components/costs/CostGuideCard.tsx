import Link from 'next/link'
import { CircleDollarSign } from 'lucide-react'
import { countryMeta } from '@/lib/content/hubs'

interface CostGuideCardProps {
  href: string
  countryKey: string
  /** Slug-derived label when no SEO title is available */
  label: string
  title?: string
  description?: string
  costEstimate?: string
  compact?: boolean
}

export function CostGuideCard({
  href,
  countryKey,
  label,
  title,
  description,
  costEstimate,
  compact = false,
}: CostGuideCardProps) {
  const meta = countryMeta[`guides/${countryKey}-ivf-guide`]
  const countryName = meta?.name
  const flag = meta?.flag
  const estimate = costEstimate ?? meta?.cost
  const displayTitle = title ?? label

  if (compact) {
    return (
      <Link
        href={href}
        className="group flex min-h-[72px] items-start gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          {flag ? (
            <span className="text-lg leading-none" role="img" aria-label={countryName}>
              {flag}
            </span>
          ) : (
            <CircleDollarSign size={18} aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          {countryName && (
            <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              {countryName}
            </span>
          )}
          <span className="mt-0.5 block font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
            {displayTitle}
          </span>
          {description && (
            <span className="mt-1 block line-clamp-2 text-sm text-[var(--color-neutral-600)]">
              {description}
            </span>
          )}
          {estimate && (
            <span className="mt-2 block text-xs text-[var(--color-neutral-400)]">Est. {estimate}</span>
          )}
          <span className="mt-2 block text-sm font-medium text-[var(--color-accent-600)]">
            Read full guide →
          </span>
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group flex min-h-[88px] flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
    >
      {countryName && flag ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl leading-none" role="img" aria-label={countryName}>
            {flag}
          </span>
          <span className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
            {countryName}
          </span>
        </div>
      ) : null}
      <p className="text-sm font-medium text-[var(--color-primary-950)]">{displayTitle}</p>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-[var(--color-neutral-600)]">{description}</p>
      )}
      {!description && label !== displayTitle && (
        <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{label}</p>
      )}
      {estimate && (
        <p className="mt-2 text-xs text-[var(--color-neutral-400)]">Est. {estimate}</p>
      )}
      <p className="mt-auto pt-4 text-xs font-medium text-[var(--color-accent-600)]">
        Read full guide →
      </p>
    </Link>
  )
}
