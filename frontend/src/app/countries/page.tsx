import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CountriesList, CountriesListSkeleton } from '@/components/hubs/CountriesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.countries.title, description: t.meta.countries.description }
}

export default function CountriesHubPage() {
  const t = getDictionary(locale)

  const heroStats = [
    { value: '6', label: t.hubs.countries.hero.statCountries },
    { value: '5+', label: t.hubs.countries.hero.statTreatments },
    { value: '80+', label: t.hubs.countries.hero.statClinics },
    { value: '500+', label: t.hubs.countries.hero.statInterviews },
  ]

  return (
    <>
      <HubHero
        eyebrow={t.hubs.countries.hero.eyebrow}
        title={t.hubs.countries.hero.title}
        subtitle={t.hubs.countries.hero.subtitle}
        stats={heroStats}
      />
      <HubPageLayout
        locale={locale}
        hubId="countries"
        title={t.hubs.countries.title}
        description={t.hubs.countries.description}
        showHeading={false}
      >
        <Suspense fallback={<CountriesListSkeleton />}>
          <CountriesList locale={locale} />
        </Suspense>
      </HubPageLayout>
    </>
  )
}
