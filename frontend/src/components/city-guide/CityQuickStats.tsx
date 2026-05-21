import { Building2, Users, Globe, Clock } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'

interface StatItem {
  icon: React.ReactNode
  label: string
  value: string
}

interface CityQuickStatsProps {
  page: ContentPage
}

export function CityQuickStats({ page }: CityQuickStatsProps) {
  const stats: StatItem[] = [
    {
      icon: <Globe size={16} aria-hidden="true" />,
      label: 'Content Quality',
      value: page.scores.seo != null ? `${Math.round(page.scores.seo)}/100` : '—',
    },
    {
      icon: <Building2 size={16} aria-hidden="true" />,
      label: 'Language',
      value: page.language,
    },
    {
      icon: <Users size={16} aria-hidden="true" />,
      label: 'Word Count',
      value: page.content.wordCount > 0 ? `${page.content.wordCount.toLocaleString()} words` : '—',
    },
    {
      icon: <Clock size={16} aria-hidden="true" />,
      label: 'Last Updated',
      value: page.updatedAt
        ? new Date(page.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : '—',
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
