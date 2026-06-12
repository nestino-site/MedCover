import type { ReactNode } from 'react'
import { CrossHubNav } from './CrossHubNav'
import type { HubId } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'
import type { ActiveFilters } from '@/lib/content/filter-utils'

type HubPageLayoutProps = {
  title: string
  description: string
  children: ReactNode
  locale: Locale
  hubId?: HubId
  showCrossLinks?: boolean
  showHeading?: boolean
  fromFilters?: ActiveFilters
}

export function HubPageLayout({
  title,
  description,
  children,
  locale,
  hubId,
  showCrossLinks = true,
  showHeading = true,
  fromFilters,
}: HubPageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {showHeading && (
        <div className="mb-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-lg text-[var(--color-neutral-600)]">{description}</p>
        </div>
      )}
      {children}
      {showCrossLinks && hubId && (
        <CrossHubNav
          locale={locale}
          hubId={hubId}
          className="mt-12"
          fromFilters={fromFilters}
        />
      )}
    </div>
  )
}
