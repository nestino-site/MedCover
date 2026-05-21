import Link from 'next/link'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { en } from '@/lib/i18n/en'

const navLinks = [
  { label: en.nav.guides, href: '/guides/' },
  { label: en.nav.costs, href: '/costs/' },
  { label: en.nav.compare, href: '/compare/' },
  { label: en.nav.about, href: '/about/' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label={en.aria.mainNavigation}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/for-clinics/"
            className="hidden text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary-700)] transition-colors lg:block"
          >
            {en.nav.forClinics}
          </Link>
          <Link
            href="/start/"
            className="hidden rounded-xl bg-[var(--color-primary-900)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-800)] transition-colors lg:block"
          >
            {en.nav.getStarted}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
