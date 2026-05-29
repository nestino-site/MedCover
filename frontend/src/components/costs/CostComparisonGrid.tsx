import Link from 'next/link'
import { countryMeta } from '@/lib/content/hubs'
import { localizedPath, type Locale } from '@/lib/i18n'

export interface CostComparisonGridProps {
  locale: Locale
  sort?: string
  country?: string
}

export function CostComparisonGrid({ locale, sort, country }: CostComparisonGridProps) {
  let countries = Object.entries(countryMeta).map(([slug, meta]) => ({
    slug,
    ...meta,
    href: localizedPath(`/${slug}`, locale),
    costNumeric: parseInt(meta.cost.replace(/[^0-9]/g, '') || '99999'),
  }))

  // Filter by country
  if (country) {
    countries = countries.filter((c) => c.slug === `guides/${country}-ivf-guide`)
  }

  // Sort
  if (sort === 'alpha') {
    countries = [...countries].sort((a, b) => a.name.localeCompare(b.name))
  } else {
    // Default: sort by cost ascending
    countries = [...countries].sort((a, b) => a.costNumeric - b.costNumeric)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {countries.map((c, i) => (
        <Link
          key={c.slug}
          href={c.href}
          className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          {/* Flag header */}
          <div className="flex items-center gap-3 bg-[var(--color-primary-50)] px-5 py-5">
            <span className="text-4xl leading-none" role="img" aria-label={c.name}>
              {c.flag}
            </span>
            <div>
              <p className="font-bold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {c.name}
              </p>
              <p className="text-xs text-[var(--color-neutral-500)]">{c.tagline}</p>
            </div>
            {i === 0 && sort !== 'alpha' && (
              <span className="ml-auto shrink-0 rounded-full bg-[var(--color-accent-100)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-700)]">
                Lowest
              </span>
            )}
          </div>

          {/* Cost details */}
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-[var(--color-neutral-400)]">Estimated cost</p>
                <p className="text-2xl font-bold text-[var(--color-primary-800)]">{c.cost}</p>
              </div>
              <span className="text-sm text-[var(--color-neutral-500)]">{c.clinics}</span>
            </div>
            <p className="mt-4 text-xs font-medium text-[var(--color-accent-600)]">
              View destination guide →
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
