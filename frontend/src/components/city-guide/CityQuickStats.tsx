import { Stethoscope, Globe, CircleDollarSign, Building2 } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { parseCitySlug, countryMeta } from '@/lib/content/hubs'
import { treatmentCategories } from '@/lib/content/treatments'
import { en } from '@/lib/i18n/en'

interface StatItem {
  icon: React.ReactNode
  label: string
  value: string
}

interface CityQuickStatsProps {
  page: ContentPage
}

export function CityQuickStats({ page }: CityQuickStatsProps) {
  const parsed = parseCitySlug(page.slug)
  const countrySlug = parsed ? `guides/${parsed.countryKey}-ivf-guide` : null
  const meta = countrySlug ? countryMeta[countrySlug] : null
  const activeTreatment = treatmentCategories.find((c) => c.status === 'active')

  const stats: StatItem[] = [
    {
      icon: <Stethoscope size={16} aria-hidden="true" />,
      label: en.cityGuide.stats.treatment,
      value: activeTreatment?.name ?? '—',
    },
    {
      icon: <Globe size={16} aria-hidden="true" />,
      label: en.cityGuide.stats.country,
      value: meta ? `${meta.flag} ${parsed?.countryName ?? '—'}` : '—',
    },
    {
      icon: <CircleDollarSign size={16} aria-hidden="true" />,
      label: en.cityGuide.stats.estimatedCost,
      value: meta?.cost || '—',
    },
    {
      icon: <Building2 size={16} aria-hidden="true" />,
      label: en.cityGuide.stats.clinics,
      value: meta?.clinics || '—',
    },
  ]

  return (
    <div
      data-speakable="true"
      className="my-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-2 bg-[var(--color-surface)] px-5 py-5"
        >
          <div className="flex items-center gap-2 text-[var(--color-accent-600)]">
            {stat.icon}
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
              {stat.label}
            </span>
          </div>
          <p className="text-lg font-bold text-[var(--color-primary-950)]">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
