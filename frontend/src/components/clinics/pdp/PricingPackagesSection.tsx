import { Check, X } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { formatCurrency, formatPriceRange } from '@/lib/clinics/format'

type PricingPackagesSectionProps = {
  clinic: ClinicDetail
}

export function PricingPackagesSection({ clinic }: PricingPackagesSectionProps) {
  if (clinic.pricingPackages.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-[var(--color-primary-950)]">Pricing packages</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {clinic.pricingPackages.map((pkg, i) => {
          const title = pkg.packageName ?? pkg.treatmentType
          const price =
            pkg.basePrice != null
              ? formatCurrency(pkg.basePrice, pkg.currency)
              : formatPriceRange(pkg.priceMin, pkg.priceMax, pkg.currency)

          return (
            <article
              key={`${pkg.treatmentType}-${pkg.packageName ?? i}`}
              className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
            >
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                  {pkg.treatmentType}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-primary-950)]">{title}</h3>
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
                <p className="mt-auto text-sm text-[var(--color-neutral-600)]">{pkg.notes}</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
