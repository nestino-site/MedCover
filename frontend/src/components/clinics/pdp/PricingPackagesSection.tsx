'use client'

import Link from 'next/link'
import { Check, X } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { formatCurrency, formatPriceRange } from '@/lib/clinics/format'
import { clinicCityTreatmentPath, costCityPath } from '@/lib/routes'
import type { Locale } from '@/lib/i18n'
import { en } from '@/lib/i18n/en'

type PricingPackagesSectionProps = {
  clinic: ClinicDetail
  country: string
  city: string
  cityName: string
  locale?: Locale
}

function resolveTreatmentSlug(
  treatmentType: string,
  clinic: ClinicDetail,
): { slug: string; name: string } | null {
  const normalized = treatmentType.trim().toLowerCase()
  const match = clinic.treatments.find(
    (t) =>
      t.slug.toLowerCase() === normalized ||
      t.name.toLowerCase() === normalized ||
      t.name.toLowerCase().includes(normalized) ||
      normalized.includes(t.slug.toLowerCase()),
  )
  return match ?? null
}

export function PricingPackagesSection({
  clinic,
  country,
  city,
  cityName,
  locale = 'en',
}: PricingPackagesSectionProps) {
  if (clinic.pricingPackages.length === 0) return null

  const copy = en.clinicPdp.sections.pricing

  return (
    <section id="pricing" className="scroll-mt-28">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} className="mb-6" />
      <div className="grid gap-6 md:grid-cols-2">
        {clinic.pricingPackages.map((pkg, i) => {
          const title = pkg.packageName ?? pkg.treatmentType
          const price =
            pkg.basePrice != null
              ? formatCurrency(pkg.basePrice, pkg.currency)
              : formatPriceRange(pkg.priceMin, pkg.priceMax, pkg.currency)
          const treatment = resolveTreatmentSlug(pkg.treatmentType, clinic)

          return (
            <article
              key={`${pkg.treatmentType}-${pkg.packageName ?? i}`}
              className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
            >
              <div className="mb-4">
                {treatment ? (
                  <Link
                    href={clinicCityTreatmentPath(country, city, treatment.slug, locale)}
                    className="inline-flex rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-700)] transition-colors hover:bg-[var(--color-primary-100)]"
                  >
                    {treatment.name}
                  </Link>
                ) : (
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                    {pkg.treatmentType}
                  </p>
                )}
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-primary-950)]">{title}</h3>
                <p className="mt-2 text-2xl font-bold text-[var(--color-primary-900)]">{price}</p>
                {pkg.lastVerifiedAt && (
                  <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                    Verified {new Date(pkg.lastVerifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {pkg.includes && pkg.includes.length > 0 && (
                <ul className="mb-4 space-y-2">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-[var(--color-neutral-700)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {pkg.excludes && pkg.excludes.length > 0 && (
                <ul className="mb-4 space-y-2 border-t border-[var(--color-border)] pt-4">
                  {pkg.excludes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-[var(--color-neutral-500)]">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-neutral-400)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {pkg.notes && (
                <p className="text-sm text-[var(--color-neutral-600)]">{pkg.notes}</p>
              )}

              {treatment && (
                <Link
                  href={costCityPath(treatment.slug, country, city, locale)}
                  className="mt-4 text-sm font-medium text-[var(--color-accent-600)] hover:text-[var(--color-accent-700)]"
                >
                  {en.clinicPdp.pricing.compareCosts
                    .replace('{treatment}', treatment.name)
                    .replace('{city}', cityName)}
                </Link>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
