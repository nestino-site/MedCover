import Link from 'next/link'
import { ArrowLeft, MapPin, Search, Stethoscope } from 'lucide-react'
import { getDictionary, localizedPath, DEFAULT_LOCALE } from '@/lib/i18n'
import {
  clinicsHubPath,
  countriesHubPath,
  costHubPath,
  treatmentsHubPath,
} from '@/lib/routes'

export default function NotFound() {
  const locale = DEFAULT_LOCALE
  const t = getDictionary(locale)

  const quickLinks = [
    { href: countriesHubPath(locale), label: t.nav.countries, icon: MapPin },
    { href: clinicsHubPath(locale), label: t.nav.cities, icon: Search },
    { href: treatmentsHubPath(locale), label: t.nav.treatments, icon: Stethoscope },
    { href: costHubPath(locale), label: t.nav.costs, icon: Search },
  ]

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, var(--color-accent-100) 0%, transparent 45%),
            radial-gradient(circle at 80% 80%, var(--color-primary-100) 0%, transparent 40%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-neutral-400)]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-5xl">
          {t.notFound.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-neutral-600)]">
          {t.notFound.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={countriesHubPath(locale)}
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

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--color-primary-800)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                <Icon size={16} aria-hidden="true" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
