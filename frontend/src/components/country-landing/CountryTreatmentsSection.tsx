import Link from 'next/link'
import { treatmentCategories } from '@/lib/content/treatments'
import { localizedPath } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'

interface CountryTreatmentsSectionProps {
  countryName: string
  countryKey?: string
}

export function CountryTreatmentsSection({ countryName }: CountryTreatmentsSectionProps) {
  const t = en.countryLanding.treatmentsSection

  return (
    <section aria-labelledby="treatments-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.eyebrow}
        </p>
        <h2 id="treatments-heading" className="mt-1 text-2xl font-bold text-[var(--color-primary-950)]">
          {t.heading} — {countryName}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {treatmentCategories.map((treatment) => {
          const isActive = treatment.status === 'active'
          return (
            <div
              key={treatment.id}
              className={`rounded-2xl border p-5 ${
                isActive
                  ? 'border-[var(--color-primary-200)] bg-white'
                  : 'border-dashed border-[var(--color-border)] bg-[var(--color-neutral-50)] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`font-bold ${isActive ? 'text-[var(--color-primary-950)]' : 'text-[var(--color-neutral-500)]'}`}>
                  {treatment.name}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isActive
                      ? 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                  }`}
                >
                  {isActive ? t.active : t.comingSoon}
                </span>
              </div>

              {isActive && (
                <div className="mt-4">
                  <Link
                    href={localizedPath(`/treatments/${treatment.id}`, 'en')}
                    className="inline-flex rounded-lg border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-100)]"
                  >
                    {t.viewTreatmentHub} →
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
