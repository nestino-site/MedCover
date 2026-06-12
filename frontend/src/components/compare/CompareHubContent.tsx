import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { getTaxonomy } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import { buildCompareHubItemsFromPages } from '@/lib/compare/static-params'
import { getCountryDisplayFromTaxonomy } from '@/lib/content/hubs'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, type Locale } from '@/lib/i18n'
import {
  clinicsHubPath,
  costHubPath,
  countriesHubPath,
  slugToLabel,
} from '@/lib/routes'
import { CardGridSkeleton, GuidePostCardSkeleton } from '@/components/ui/skeletons'
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton'
import type { CompareHubItem } from '@/lib/compare/static-params'

const TREATMENT_LABELS: Record<string, string> = {
  ivf: 'IVF',
  dental: 'Dental',
  hair: 'Hair Restoration',
  'hair-transplant': 'Hair Transplant',
  cosmetic: 'Cosmetic Surgery',
}

const TREATMENT_BADGE_CLASS: Record<string, string> = {
  ivf: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
  dental: 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]',
  hair: 'bg-[var(--color-trust-100)] text-[var(--color-trust-700)]',
  'hair-transplant': 'bg-[var(--color-trust-100)] text-[var(--color-trust-700)]',
  cosmetic: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
}

function entityDisplayName(
  slug: string,
  type: CompareHubItem['type'],
  locationMeta: Record<string, { flag: string; name: string; cost: string }>,
  cityMeta: Record<string, { name: string; countrySlug: string }>,
): string {
  if (type === 'country') {
    return locationMeta[slug]?.name ?? slugToLabel(slug)
  }
  if (type === 'city') {
    return cityMeta[slug]?.name ?? slugToLabel(slug)
  }
  return slugToLabel(slug)
}

function LocationChip({
  label,
  flag,
}: {
  label: string
  flag?: string
}) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary-900)]">
      {flag && (
        <span role="img" aria-label={label}>
          {flag}
        </span>
      )}
      {label}
    </span>
  )
}

function ComparisonCard({
  item,
  t,
  locationMeta,
  cityMeta,
}: {
  item: CompareHubItem
  t: ReturnType<typeof getDictionary>
  locationMeta: Record<string, { flag: string; name: string; cost: string }>
  cityMeta: Record<string, { name: string; countrySlug: string }>
}) {
  const treatmentKey = item.treatmentKey ?? 'ivf'
  const treatment = TREATMENT_LABELS[treatmentKey] ?? slugToLabel(treatmentKey)
  const badgeClass = TREATMENT_BADGE_CLASS[treatmentKey] ?? TREATMENT_BADGE_CLASS.ivf

  const nameA = entityDisplayName(item.entityA, item.type, locationMeta, cityMeta)
  const nameB = entityDisplayName(item.entityB, item.type, locationMeta, cityMeta)
  const flagA =
    item.type === 'country' ? locationMeta[item.entityA]?.flag : undefined
  const flagB =
    item.type === 'country' ? locationMeta[item.entityB]?.flag : undefined

  const costs =
    item.type === 'country'
      ? [locationMeta[item.entityA]?.cost, locationMeta[item.entityB]?.cost].filter(Boolean)
      : []
  const costRange =
    costs.length >= 2 ? `${costs[0]} — ${costs[costs.length - 1]}` : costs[0] ?? null

  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        {item.type !== 'clinic' && (
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {treatment}
          </span>
        )}
        {item.type === 'clinic' && (
          <span className="shrink-0 rounded-full bg-[var(--color-neutral-100)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-neutral-700)]">
            Clinics
          </span>
        )}
        <span className="flex items-center gap-1">
          <LocationChip label={nameA} flag={flagA} />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
            {t.hubs.compareHub.vsLabel}
          </span>
          <LocationChip label={nameB} flag={flagB} />
        </span>
      </div>
      {costRange && (
        <p className="mt-2 text-xs text-[var(--color-neutral-500)]">
          Cost range: <span className="font-semibold text-[var(--color-primary-800)]">{costRange}</span>
        </p>
      )}
      <p className="mt-3 text-sm font-medium text-[var(--color-accent-600)] group-hover:text-[var(--color-accent-700)]">
        {t.hubs.compareHub.readComparison} →
      </p>
    </Link>
  )
}

function EmptyState({ locale, t }: { locale: Locale; t: ReturnType<typeof getDictionary> }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-8 py-12 text-center">
      <p className="text-lg font-semibold text-[var(--color-primary-950)]">
        {t.hubs.compareHub.emptyStateHeadline}
      </p>
      <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
        Our team is verifying patient data to build side-by-side destination comparisons.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={costHubPath(locale)}
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary-900)] transition hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
        >
          Cost guides →
        </Link>
        <Link
          href={countriesHubPath(locale)}
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary-900)] transition hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
        >
          Country guides →
        </Link>
        <Link
          href={clinicsHubPath(locale)}
          className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary-900)] transition hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
        >
          Clinic directory →
        </Link>
      </div>
    </div>
  )
}

export async function CompareHubContent({ locale }: { locale: Locale }) {
  'use cache'
  cacheLife('max')
  cacheTag(cacheTags.publishedPages, cacheTags.hub('compare'))

  const t = getDictionary(locale)
  const [taxonomy, pages] = await Promise.all([getTaxonomy(), listPublishedPagesSafe()])
  const items = buildCompareHubItemsFromPages(pages, taxonomy, locale)

  const locationMeta = Object.fromEntries(
    taxonomy.countries.map((country) => {
      const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
      return [country.slug, { flag: display.flag, name: display.name, cost: display.cost }]
    }),
  )

  const cityMeta = Object.fromEntries(
    taxonomy.countries.flatMap((country) =>
      country.cities.map((city) => [
        city.slug,
        { name: city.name, countrySlug: country.slug },
      ]),
    ),
  )

  if (items.length === 0) {
    return <EmptyState locale={locale} t={t} />
  }

  const groups: Record<string, CompareHubItem[]> = {}
  for (const item of items) {
    const groupKey =
      item.type === 'clinic' ? 'clinic' : (item.treatmentKey ?? 'ivf')
    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(item)
  }

  const groupLabels: Record<string, string> = {
    clinic: 'Clinic Comparisons',
    ...TREATMENT_LABELS,
  }

  return (
    <div className="space-y-12">
      {Object.entries(groups).map(([groupKey, groupItems]) => (
        <section key={groupKey}>
          <h2 className="mb-5 text-xl font-bold text-[var(--color-primary-950)]">
            {groupKey === 'clinic'
              ? 'Clinic Comparisons'
              : `${groupLabels[groupKey] ?? slugToLabel(groupKey)} Comparisons`}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupItems.map((item) => (
              <ComparisonCard
                key={item.slug}
                item={item}
                t={t}
                locationMeta={locationMeta}
                cityMeta={cityMeta}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function CompareHubContentSkeleton() {
  return (
    <SkeletonStatus label="Loading comparisons" className="space-y-12">
      <div>
        <Skeleton className="mb-5 h-7 w-48" rounded="lg" />
        <CardGridSkeleton count={3}>
          <GuidePostCardSkeleton variant="featured" />
        </CardGridSkeleton>
      </div>
    </SkeletonStatus>
  )
}
