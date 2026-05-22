import Link from 'next/link'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { getDictionary, type Locale } from '@/lib/i18n'
import { partitionGuides } from '@/lib/content/hubs'
import { getFeaturedCountries } from '@/lib/content/hubs'
import {
  getExploreHubs,
  hubPath,
  type SiteHub,
} from '@/lib/content/site-nav'
import { cn } from '@/lib/utils/cn'

function hubDescription(hub: SiteHub, locale: Locale, countryCount: number, cityCount: number): string {
  const t = getDictionary(locale)
  switch (hub.id) {
    case 'countries':
      return `${countryCount} ${t.hubs.countries.cardDescription}`
    case 'cities':
      return cityCount > 0
        ? `${cityCount} ${t.hubs.cities.cardDescription}`
        : t.hubs.cities.cardDescriptionEmpty
    case 'treatments':
      return t.hubs.treatments.description
    case 'guides':
      return t.hubs.guides.description
    case 'clinics':
      return t.hubs.comingSoon.clinics.description
    case 'costs':
      return t.hubs.comingSoon.costs.description
    case 'compare':
      return t.hubs.comingSoon.compare.description
    default:
      return ''
  }
}

function HubCard({ hub, locale, description }: { hub: SiteHub; locale: Locale; description: string }) {
  const t = getDictionary(locale)
  const href = hubPath(hub.id, locale)
  const isSoon = hub.status === 'coming_soon'
  const Icon = hub.icon
  const label = t.nav[hub.labelKey]

  const inner = (
    <>
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          isSoon ? 'bg-[var(--color-neutral-100)]' : 'bg-[var(--color-primary-100)]',
        )}
      >
        <Icon
          size={24}
          className={isSoon ? 'text-[var(--color-neutral-500)]' : 'text-[var(--color-primary-700)]'}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--color-primary-950)]">{label}</h2>
          {isSoon && (
            <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              {t.nav.soon}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-neutral-600)]">{description}</p>
        <p
          className={cn(
            'mt-3 text-sm font-medium',
            isSoon ? 'text-[var(--color-neutral-400)]' : 'text-[var(--color-accent-600)]',
          )}
        >
          {isSoon ? t.home.explore.comingSoonAction : `${t.home.explore.exploreAction} →`}
        </p>
      </div>
    </>
  )

  const className = cn(
    'group flex items-start gap-4 rounded-2xl border p-6 transition-all',
    isSoon
      ? 'border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] opacity-90'
      : 'border-[var(--color-border)] bg-white hover:-translate-y-0.5 hover:shadow-lg',
  )

  if (isSoon) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}

export async function HubExploreGrid({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const pages = await listPublishedPagesSafe()
  const { countries, cities } = partitionGuides(pages, locale)
  const countryCount = countries.length || getFeaturedCountries(locale).length
  const cityCount = cities.length

  const hubs = getExploreHubs()
  const activeHubs = hubs.filter((h) => h.status === 'active')
  const soonHubs = hubs.filter((h) => h.status === 'coming_soon')

  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-primary-950)]">
          {t.home.explore.title}
        </h2>
        <p className="mt-2 text-[var(--color-neutral-600)]">{t.home.explore.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {activeHubs.map((hub) => (
          <HubCard
            key={hub.id}
            hub={hub}
            locale={locale}
            description={hubDescription(hub, locale, countryCount, cityCount)}
          />
        ))}
      </div>
      {soonHubs.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {soonHubs.map((hub) => (
            <HubCard
              key={hub.id}
              hub={hub}
              locale={locale}
              description={hubDescription(hub, locale, countryCount, cityCount)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HubExploreGridSkeleton() {
  return (
    <div>
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
    </div>
  )
}
