import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ComingSoonHub } from '@/components/hubs/ComingSoonHub'
import { getDictionary, type Locale } from '@/lib/i18n'
import { isLocale } from '@/lib/i18n/locales'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'en'
  const t = getDictionary(locale)
  return {
    title: t.meta.start.title,
    description: t.meta.start.description,
    robots: { index: false, follow: true },
  }
}

export default async function StartPage({ params }: Props) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = getDictionary(locale)

  return (
    <ComingSoonHub
      locale={locale}
      title={t.hubs.comingSoon.start.title}
      description={t.hubs.comingSoon.start.description}
    />
  )
}
