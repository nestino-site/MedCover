import Link from 'next/link'
import { getTaxonomy, listClinics } from '@/lib/api/catalog'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { Card } from '@/components/ui/Card'
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
          <Card key={country.slug} interactive>
            <Link
              href={clinicCountryPath(country.slug, locale)}
              className="flex items-center gap-3 p-6"
            >
              {country.flagEmoji && (
                <span className="text-3xl" aria-hidden>
                  {country.flagEmoji}
                </span>
              )}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-primary-900)] group-hover:underline">
                  {country.name}
                </h3>
                {country.clinicCount > 0 && (
                  <p className="text-sm text-[var(--color-neutral-500)]">
                    {country.clinicCount} clinic{country.clinicCount === 1 ? '' : 's'}
                  </p>
                )}
              </div>
            </Link>
          </Card>
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
