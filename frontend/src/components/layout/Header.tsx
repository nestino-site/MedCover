import { Suspense } from 'react'
import { Logo } from './Logo'
import {
  HeaderMegaMenu,
  HeaderMegaMenuFallback,
  HeaderMobileMenu,
  HeaderMobileMenuFallback,
} from './HeaderNav'
import { LanguageSwitcher } from './LanguageSwitcher'
import { getDictionary, type Locale } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { Button } from '@/components/ui/Button'

type HeaderProps = {
  locale: Locale
}

export function Header({ locale }: HeaderProps) {
  const t = getDictionary(locale)

  return (
    <header className="relative sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8" id="site-header-shell">
        <div className="flex items-center justify-between gap-6">
        <Logo locale={locale} />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.aria.mainNavigation}>
          <Suspense fallback={<HeaderMegaMenuFallback locale={locale} t={t} />}>
            <HeaderMegaMenu locale={locale} t={t} />
          </Suspense>
        </nav>

        <div className="flex items-center gap-3">
          <SearchTriggerButton />
          <LanguageSwitcher />
          <Button href={hubPath('clinics', locale)} variant="primary" size="md" className="hidden md:inline-flex">
            {t.nav.matchClinic}
          </Button>
          <Suspense fallback={<HeaderMobileMenuFallback locale={locale} />}>
            <HeaderMobileMenu locale={locale} />
          </Suspense>
        </div>
        </div>
      </div>
    </header>
  )
}
