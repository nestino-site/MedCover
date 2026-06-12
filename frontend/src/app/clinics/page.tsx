import type { Metadata } from 'next'
import Link from 'next/link'
import { getTaxonomy, listClinics } from '@/lib/api/catalog'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { ClinicCard } from '@/components/clinics/ClinicCard'
import { CmsPageJsonLd } from '@/components/seo/CmsPageJsonLd'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { activeLocale } from '@/lib/i18n/locale'
import { clinicCountryPath, cmsPageSlug } from '@/lib/routes'
import {
  cmsMetadataForSlug,
  hubCopyFromCmsPage,
  loadCmsPage,
} from '@/lib/seo/cms-seo'

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadataForSlug(cmsPageSlug('clinics'))
}

export default async function ClinicsHubPage() {
  const locale = activeLocale
  const cms = await loadCmsPage(cmsPageSlug('clinics'))
  const hubCopy = cms.status === 'ok' ? hubCopyFromCmsPage(cms.page) : {}

  const taxonomy = await getTaxonomy()
  const topClinics = await listClinics({ sort: 'rating', limit: 6 })

  const totalClinics = taxonomy.countries.reduce((s, c) => s + c.clinicCount, 0)

  return (
    <>
      <CmsPageJsonLd result={cms} />
      <HubHero
        variant="compact"
        eyebrow="Clinics"
        title={hubCopy.title ?? 'Find verified clinics abroad'}
        subtitle={
          hubCopy.description ??
          (totalClinics > 0
            ? `Explore ${totalClinics} verified clinics across ${taxonomy.countries.length} destinations.`
            : 'Explore verified clinics with transparent patient data and pricing.')
        }
      />
      <HubPageLayout
        locale={locale}
        hubId="clinics"
        title=""
        description=""
        showHeading={false}
        showCrossLinks
      >
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchTriggerButton className="min-w-[200px] flex-1 sm:max-w-md" />
        </div>

        {taxonomy.countries.length > 0 && (
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
        )}

        {topClinics.items.length > 0 && (
          <section>
            <SectionHeading title="Top-rated clinics" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topClinics.items.map((clinic, i) => (
                <ClinicCard key={clinic.urlPath} clinic={clinic} priority={i < 3} />
              ))}
            </div>
          </section>
        )}
      </HubPageLayout>
    </>
  )
}
