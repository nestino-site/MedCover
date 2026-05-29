import Link from 'next/link'
import { Suspense } from 'react'
import { Logo } from './Logo'
import {
  HeaderMegaMenu,
  HeaderMegaMenuFallback,
  HeaderMobileMenu,
  HeaderMobileMenuFallback,
} from './HeaderNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'

type HeaderProps = {
  locale: Locale
}

export function Header({ locale }: HeaderProps) {
  const t = getDictionary(locale)

  return (
    <header className="relative sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Logo locale={locale} />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.aria.mainNavigation}>
          <Suspense fallback={<HeaderMegaMenuFallback locale={locale} t={t} />}>
            <HeaderMegaMenu locale={locale} t={t} />
          </Suspense>
          <Link
            href={localizedPath('/about', locale)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] lg:px-4"
          >
            {t.nav.about}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={hubPath('clinics', locale)}
            className="hidden items-center gap-2 rounded-xl bg-[var(--color-primary-900)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)] md:inline-flex"
          >
            {t.nav.matchClinic}
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {t.nav.soon}
            </span>
          </Link>
          <Suspense fallback={<HeaderMobileMenuFallback locale={locale} />}>
            <HeaderMobileMenu locale={locale} />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
