import { countryMeta } from '@/lib/content/hubs'

// Build a flat key→meta lookup (e.g. 'spain' → { flag, name, cost, clinics, tagline })
const LOCATION_META: Record<
  string,
  { flag: string; name: string; cost: string; clinics: string; tagline: string }
> = Object.fromEntries(
  Object.entries(countryMeta).map(([slug, meta]) => {
    const key = slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
    return [key, meta]
  }),
)

const KNOWN_TREATMENTS = ['ivf', 'hair-transplant', 'dental', 'hair', 'cosmetic']
const TREATMENT_LABELS: Record<string, string> = {
  ivf: 'IVF',
  dental: 'Dental',
  hair: 'Hair Restoration',
  'hair-transplant': 'Hair Transplant',
  cosmetic: 'Cosmetic Surgery',
}

export function parseComparisonSlug(slug: string): {
  treatment: string
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
  return { treatment: TREATMENT_LABELS[treatmentKey] ?? 'Treatment', locations }
}

function locationLabel(key: string) {
  return LOCATION_META[key]?.name ?? key.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
}

interface LocationCardProps {
  locationKey: string
  isHighlighted?: boolean
}

function LocationCard({ locationKey, isHighlighted }: LocationCardProps) {
  const meta = LOCATION_META[locationKey]
  const name = meta?.name ?? locationLabel(locationKey)
  const flag = meta?.flag ?? '🌍'

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border px-5 py-5 text-center transition ${
        isHighlighted
          ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)]'
          : 'border-[var(--color-border)] bg-white'
      }`}
    >
      <span className="text-4xl leading-none" role="img" aria-label={name}>
        {flag}
      </span>
      <p className="mt-2 font-bold text-[var(--color-primary-950)]">{name}</p>

      {meta?.cost && (
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{meta.cost}</p>
      )}
      {meta?.clinics && (
        <p className="text-xs text-[var(--color-neutral-400)]">{meta.clinics}</p>
      )}
      {meta?.tagline && (
        <p className="mt-2 text-xs font-medium text-[var(--color-accent-600)]">{meta.tagline}</p>
      )}
    </div>
  )
}

interface ComparisonDetailHeaderProps {
  /** The full slug path, e.g. ['compare', 'ivf-spain-vs-greece'] */
  slug: string[]
}

export function ComparisonDetailHeader({ slug }: ComparisonDetailHeaderProps) {
  const fullSlug = slug.join('/')
  const { treatment, locations } = parseComparisonSlug(fullSlug)

  const locationLabels = locations.map(locationLabel)
  const colsClass =
    locations.length === 3 ? 'grid-cols-3' : locations.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Treatment badge */}
        <span className="inline-flex items-center rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-700)]">
          {treatment} Comparison
        </span>

        {/* Speakable summary */}
        {locations.length >= 2 && (
          <p
            className="mt-3 text-sm text-[var(--color-neutral-600)]"
            data-speakable="true"
          >
            Side-by-side comparison of {treatment} treatment in{' '}
            {locationLabels.slice(0, -1).join(', ')} and {locationLabels.at(-1)} — costs,
            clinic quality, and patient outcomes from verified data.
          </p>
        )}

        {/* Location cards */}
        <div className={`mt-6 grid gap-4 ${colsClass}`}>
          {locations.map((key, i) => (
            <div key={key} className="relative">
              {i > 0 && (
                <div
                  className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2"
                  aria-hidden="true"
                >
                  <span className="rounded-full border border-[var(--color-border)] bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-[var(--color-neutral-500)] shadow-sm">
                    vs
                  </span>
                </div>
              )}
              <LocationCard locationKey={key} isHighlighted={i === 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
