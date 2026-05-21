import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CitiesList, CitiesListSkeleton } from '@/components/hubs/CitiesList'
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

  return (
    <HubPageLayout
      locale={locale}
      hubId="cities"
      title={t.hubs.cities.title}
      description={t.hubs.cities.description}
    >
      <Suspense fallback={<CitiesListSkeleton />}>
        <CitiesList locale={locale} />
      </Suspense>
    </HubPageLayout>
  )
}
