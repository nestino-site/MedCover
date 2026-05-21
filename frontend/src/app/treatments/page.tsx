import type { Metadata } from 'next'
import { HubPageLayout } from '@/components/hubs/HubPageLayout'
import { TreatmentsList } from '@/components/hubs/TreatmentsList'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return { title: t.meta.treatments.title, description: t.meta.treatments.description }
}

export default function TreatmentsHubPage() {
  const t = getDictionary(locale)

  return (
    <HubPageLayout
      locale={locale}
      hubId="treatments"
      title={t.hubs.treatments.title}
      description={t.hubs.treatments.description}
    >
      <TreatmentsList locale={locale} />
    </HubPageLayout>
  )
}
