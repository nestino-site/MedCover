import type { Metadata } from 'next'
import { ComingSoonHub } from '@/components/hubs/ComingSoonHub'
import { getDictionary } from '@/lib/i18n'
import { activeLocale } from '@/lib/i18n/locale'

const locale = activeLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(locale)
  return {
    title: t.meta.clinics.title,
    description: t.meta.clinics.description,
    robots: { index: false, follow: true },
  }
}

export default function ClinicsPage() {
  const t = getDictionary(locale)

  return (
    <ComingSoonHub
      locale={locale}
      title={t.hubs.comingSoon.clinics.title}
      description={t.hubs.comingSoon.clinics.description}
    />
  )
}
