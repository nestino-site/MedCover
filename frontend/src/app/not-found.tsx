import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { getDictionary, localizedPath, DEFAULT_LOCALE } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'
import { CrossHubNav } from '@/components/hubs/CrossHubNav'

export default function NotFound() {
  const locale = DEFAULT_LOCALE
  const t = getDictionary(locale)

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--color-primary-950)]">
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-neutral-600)]">{t.notFound.description}</p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={hubPath('countries', locale)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-900)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
        >
          <Search size={15} aria-hidden="true" />
          {t.notFound.browseCountries}
        </Link>
        <Link
          href={localizedPath('/', locale)}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-50)]"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t.notFound.backHome}
        </Link>
      </div>

      <div className="mx-auto mt-12 max-w-lg">
        <CrossHubNav locale={locale} />
      </div>
    </div>
  )
}
