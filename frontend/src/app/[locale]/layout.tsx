import { notFound } from 'next/navigation'
import { getLocaleDir, isLocale, type Locale } from '@/lib/i18n/locales'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return [{ locale: 'en' }]
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()

  const locale = raw as Locale
  const dir = getLocaleDir(locale)

  return (
    <div lang={locale} dir={dir}>
      {children}
    </div>
  )
}
