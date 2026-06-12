import Link from 'next/link'
import { getTaxonomy, listClinics } from '@/lib/api/catalog'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Locale } from '@/lib/i18n'
import { clinicCountryPath } from '@/lib/routes'

export async function ClinicsHubDestinationsSection({ locale }: { locale: Locale }) {
  const taxonomy = await getTaxonomy()
  if (taxonomy.countries.length === 0) return null

  return (
    <section className="mb-14">
      <SectionHeading title="Browse by destination" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {taxonomy.countries.map((country) => (
          <Link
            key={country.slug}
            href={clinicCountryPath(country.slug, locale)}
            className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary-200)] hover:shadow-lg"
          >
            {country.flagEmoji && (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-2xl leading-none"
                aria-hidden
              >
                {country.flagEmoji}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {country.name}
              </h3>
              {country.clinicCount > 0 && (
                <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
                  {country.clinicCount} clinic{country.clinicCount === 1 ? '' : 's'}
                </p>
              )}
              <p className="mt-2 text-xs font-semibold text-[var(--color-accent-600)]">
                Browse clinics →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export async function ClinicsHubTopRatedSection() {
  const topClinics = await listClinics({ sort: 'rating', limit: 6 })
  if (topClinics.items.length === 0) return null

  return (
    <section>
      <SectionHeading title="Top-rated clinics" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topClinics.items.map((clinic, i) => (
          <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
        ))}
      </div>
    </section>
  )
}
