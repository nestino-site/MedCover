import Link from 'next/link'
import { getDictionary, type Locale } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'
import { treatmentCategories } from '@/lib/content/treatments'

export function TreatmentsList({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {treatmentCategories.map((cat) => {
        const isActive = cat.status === 'active'
        return (
          <div
            key={cat.id}
            className={`rounded-2xl border p-6 ${
              isActive
                ? 'border-[var(--color-accent-200)] bg-[var(--color-accent-50)]/30'
                : 'border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] opacity-80'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-primary-950)]">{cat.name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                  isActive
                    ? 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]'
                    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                }`}
              >
                {isActive ? t.hubs.treatments.activeBadge : t.hubs.treatments.soonBadge}
              </span>
            </div>
            {isActive && cat.id === 'ivf' && (
              <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
                {t.hubs.treatments.ivfDescription}
              </p>
            )}
            {isActive && cat.hubLinks.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {cat.hubLinks.map((link) => (
                  <li key={link.hubId}>
                    <Link
                      href={hubPath(link.hubId, locale)}
                      className="inline-flex rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-50)]"
                    >
                      {t.nav[link.labelKey]} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {isActive && cat.id === 'ivf' && (
              <Link
                href={hubPath('countries', locale)}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
              >
                {t.hubs.treatments.exploreIvf} →
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}
