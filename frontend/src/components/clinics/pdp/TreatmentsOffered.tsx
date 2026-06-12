import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TreatmentIconBadge } from '@/components/shared/TreatmentIconBadge'
import { clinicCityTreatmentPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'

type TreatmentsOfferedProps = {
  clinic: ClinicDetail
  country: string
  city: string
  locale?: Locale
}

export function TreatmentsOffered({ clinic, country, city, locale = 'en' }: TreatmentsOfferedProps) {
  if (clinic.treatments.length === 0) return null

  const copy = en.clinicPdp.sections.treatments
  const title =
    clinic.treatments.length > 0
      ? copy.titleWithCount.replace('{count}', String(clinic.treatments.length))
      : copy.title

  return (
    <section id="treatments" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={title} className="mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinic.treatments.map((t) => (
          <Card key={t.slug} as="article" interactive>
            <Link
              href={clinicCityTreatmentPath(country, city, t.slug, locale)}
              className="flex h-full flex-col gap-3 p-5"
            >
              <div className="flex items-center gap-3">
                <TreatmentIconBadge treatmentId={t.slug} size="lg" />
                <h3 className="text-base font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                  {t.name}
                </h3>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent-700)]">
                {copy.viewTreatment}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
