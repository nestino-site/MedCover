import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CitiesList, CitiesListSkeleton } from '@/components/hubs/CitiesList'
import { HubHero } from '@/components/hubs/HubHero'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.cities.title, description: t.meta.cities.description }
}

export default function CitiesHubPage() {
  const t = getDictionary(locale)

  const heroStats = [
    { value: '20+', label: t.hubs.cities.hero.statCities },
    { value: '6', label: t.hubs.cities.hero.statCountries },
  ]

  return (
    <>
      <HubHero
        eyebrow={t.hubs.cities.hero.eyebrow}
        title={t.hubs.cities.hero.title}
        subtitle={t.hubs.cities.hero.subtitle}
        stats={heroStats}
      />
      <HubPageLayout
        locale={locale}
        hubId="cities"
        title={t.hubs.cities.title}
        description={t.hubs.cities.description}
        showHeading={false}
      >
        <Suspense fallback={<CitiesListSkeleton />}>
          <CitiesList locale={locale} />
        </Suspense>
      </HubPageLayout>
    </>
  )
}
