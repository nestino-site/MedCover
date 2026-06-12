import Link from 'next/link'
import { cacheLife, cacheTag } from 'next/cache'
import { getTaxonomy } from '@/lib/api/catalog'
import { listPublishedPagesSafe } from '@/lib/api/content'
import { flagEmojiForCountry } from '@/lib/content/country-flags'
import { filterPagesByHub, getCountryDisplayFromTaxonomy } from '@/lib/content/hubs'
import { cacheTags } from '@/lib/cache/tags'
import { getDictionary, type Locale } from '@/lib/i18n'
import {
  clinicsHubPath,
  costHubPath,
  countriesHubPath,
} from '@/lib/routes'

const KNOWN_TREATMENTS = ['ivf', 'hair-transplant', 'dental', 'hair', 'cosmetic']

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

function parseComparisonSlug(slug: string): {
  treatment: string
  treatmentKey: string
  locations: string[]
} {
  const normalized = slug.replace(/^\//, '')
  const segment = normalized.split('/').pop() ?? normalized
  const cleaned = segment.replace(/-\d{4}$/, '')
  const vsParts = cleaned.split('-vs-')

  let treatmentKey = 'ivf'
  let firstLocation = vsParts[0]

  for (const t of KNOWN_TREATMENTS) {
    if (vsParts[0].startsWith(t + '-')) {
      treatmentKey = t
      firstLocation = vsParts[0].slice(t.length + 1)
      break
    } else if (vsParts[0] === t) {
      treatmentKey = t
      firstLocation = ''
      break
    }
  }

  const locations = [firstLocation, ...vsParts.slice(1)].filter(Boolean)
  return {
    treatment: TREATMENT_LABELS[treatmentKey] ?? 'Treatment',
    treatmentKey,
    locations,
  }
}

function LocationChip({
  locationKey,
  locationMeta,
}: {
  locationKey: string
  locationMeta: Record<string, { flag: string; name: string; cost: string }>
}) {
  const meta = locationMeta[locationKey]
  const display = meta?.name ?? locationKey.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
  const flag = meta?.flag || flagEmojiForCountry({ slug: locationKey })
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary-900)]">
      <span role="img" aria-label={display}>{flag}</span>
      {display}
    </span>
  )
}

function ComparisonCard({
  slug,
  locale,
  t,
  locationMeta,
}: {
  slug: string
  locale: Locale
  t: ReturnType<typeof getDictionary>
  locationMeta: Record<string, { flag: string; name: string; cost: string }>
}) {
  const normalizedSlug = slug.replace(/^\//, '')
  const href = `/${normalizedSlug}`
  const { treatment, treatmentKey, locations } = parseComparisonSlug(slug)
  const badgeClass = TREATMENT_BADGE_CLASS[treatmentKey] ?? TREATMENT_BADGE_CLASS.ivf

  const locationsMeta = locations.map((key) => locationMeta[key])
  const costs = locationsMeta.filter(Boolean).map((m) => m!.cost).filter(Boolean)
  const costRange =
    costs.length >= 2 ? `${costs[0]} — ${costs[costs.length - 1]}` : costs[0] ?? null

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {treatment}
        </span>
        {locations.map((key, i) => (
          <span key={key} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
                {t.hubs.compareHub.vsLabel}
              </span>
            )}
            <LocationChip locationKey={key} locationMeta={locationMeta} />
          </span>
        ))}
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
  const items = filterPagesByHub(pages, 'compare', locale)

  const locationMeta = Object.fromEntries(
    taxonomy.countries.map((country) => {
      const display = getCountryDisplayFromTaxonomy(country.slug, taxonomy, locale)
      return [country.slug, { flag: display.flag, name: display.name, cost: display.cost }]
    }),
  )

  if (items.length === 0) {
    return <EmptyState locale={locale} t={t} />
  }

  const groups: Record<string, typeof items> = {}
  for (const page of items) {
    const { treatmentKey } = parseComparisonSlug(page.slug)
    if (!groups[treatmentKey]) groups[treatmentKey] = []
    groups[treatmentKey].push(page)
  }

  return (
    <div className="space-y-12">
      {Object.entries(groups).map(([treatmentKey, groupPages]) => (
        <section key={treatmentKey}>
          <h2 className="mb-5 text-xl font-bold text-[var(--color-primary-950)]">
            {TREATMENT_LABELS[treatmentKey] ?? 'Treatment'} Comparisons
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupPages.map((page) => (
              <ComparisonCard
                key={page.slug}
                slug={page.slug}
                locale={locale}
                t={t}
                locationMeta={locationMeta}
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
    <div className="space-y-12">
      <div>
        <div className="mb-5 h-7 w-48 animate-pulse rounded-lg bg-[var(--color-neutral-100)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-[var(--color-neutral-100)]" />
          ))}
        </div>
      </div>
    </div>
  )
}
