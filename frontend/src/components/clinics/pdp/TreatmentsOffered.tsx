import Link from 'next/link'
import type { ClinicDetail } from '@/lib/api/types'
import { clinicCityTreatmentPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'

type TreatmentsOfferedProps = {
  clinic: ClinicDetail
  country: string
  city: string
  locale?: Locale
}

export function TreatmentsOffered({ clinic, country, city, locale = 'en' }: TreatmentsOfferedProps) {
  if (clinic.treatments.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-2xl font-bold text-[var(--color-primary-950)]">Treatments offered</h2>
      <div className="flex flex-wrap gap-2">
        {clinic.treatments.map((t) => (
          <Link
            key={t.slug}
            href={clinicCityTreatmentPath(country, city, t.slug, locale)}
            className="rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-4 py-2 text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:bg-[var(--color-primary-100)]"
          >
            {t.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
