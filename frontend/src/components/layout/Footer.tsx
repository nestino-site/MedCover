import Link from 'next/link'
import type { ReactNode } from 'react'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { hubPath } from '@/lib/content/site-nav'
import { getFeaturedCountries } from '@/lib/content/hubs'
import { getExploreHubs } from '@/lib/content/site-nav'

const companyLinks = [
  { key: 'privacy' as const, href: '/privacy/' },
  { key: 'terms' as const, href: '/terms/' },
  { key: 'methodology' as const, href: '/ai-interviewer/' },
  { key: 'contact' as const, href: '/contact/' },
]

function SocialIcon({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-primary-300)] transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  )
}

type FooterProps = {
  locale: Locale
}

export function Footer({ locale }: FooterProps) {
  const t = getDictionary(locale)
  const year = 2026
  const exploreHubs = getExploreHubs()
  const featured = getFeaturedCountries(locale).slice(0, 5)

  const mobileEssential = [
    { label: t.nav.countries, href: hubPath('countries', locale) },
    { label: t.nav.cities, href: hubPath('cities', locale) },
    { label: t.nav.treatments, href: hubPath('treatments', locale) },
    { label: t.nav.guides, href: hubPath('guides', locale) },
    { label: t.footer.links.privacy, href: localizedPath('/privacy', locale) },
  ]

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-primary-950)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="md:hidden">
          <Link href={localizedPath('/', locale)} aria-label="MedCover">
            <span className="text-lg font-bold tracking-tight text-white">
              Med<span className="font-normal opacity-80">Cover</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-[var(--color-primary-300)]">{t.footer.tagline}</p>
          <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer navigation">
            {mobileEssential.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-primary-200)] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
            <p className="text-xs text-[var(--color-primary-400)]">
              {t.footer.copyright.replace('MedCover', `${year} MedCover`)}
            </p>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="mb-10 hidden rounded-2xl border border-white/10 bg-white/5 p-6 lg:flex lg:items-center lg:justify-between lg:gap-6">
            <div className="lg:flex-1">
              <p className="font-semibold text-white">{t.brand.newsletterTitle}</p>
              <p className="mt-1 text-sm text-[var(--color-primary-300)]">{t.brand.newsletterSubtitle}</p>
            </div>
            <form className="mt-4 flex gap-2 lg:mt-0 lg:max-w-md lg:flex-1" action="#" method="post">
              <input
                type="email"
                placeholder="you@email.com"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-primary-400)] focus:border-[var(--color-accent-400)] focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[var(--color-accent-500)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-400)]"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-1">
              <Link href={localizedPath('/', locale)} aria-label="MedCover">
                <span className="text-xl font-bold tracking-tight text-white">
                  Med<span className="font-normal opacity-80">Cover</span>
                </span>
              </Link>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-primary-300)]">
                {t.footer.tagline}
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                {t.footer.sections.explore}
              </h3>
              <ul className="space-y-2.5">
                {exploreHubs.map((hub) => (
                  <li key={hub.id}>
                    <Link
                      href={hubPath(hub.id, locale)}
                      className="text-sm text-[var(--color-primary-200)] transition-colors hover:text-white"
                    >
                      {t.nav[hub.labelKey]}
                      {hub.status === 'coming_soon' ? ` (${t.nav.soon})` : ''}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                {t.footer.sections.destinations}
              </h3>
              <ul className="space-y-2.5">
                {featured.map((dest) => (
                  <li key={dest.href}>
                    <Link
                      href={dest.href}
                      className="text-sm text-[var(--color-primary-200)] transition-colors hover:text-white"
                    >
                      {t.home.ivfSpotlight.ivfIn} {dest.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={hubPath('countries', locale)}
                    className="text-sm font-medium text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)]"
                  >
                    {t.footer.allCountries} →
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                {t.footer.sections.company}
              </h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localizedPath(link.href.replace(/\/$/, ''), locale)}
                      className="text-sm text-[var(--color-primary-200)] transition-colors hover:text-white"
                    >
                      {t.footer.links[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
                {t.footer.sections.forClinics}
              </h3>
              <p className="text-sm text-[var(--color-primary-300)]">{t.footer.forClinicsBlurb}</p>
              <Link
                href={localizedPath('/start', locale)}
                className="mt-3 inline-flex text-sm font-semibold text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)]"
              >
                {t.footer.forClinicsCta} →
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-[var(--color-primary-400)]">
              {t.footer.copyright.replace('MedCover', `${year} MedCover`)}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <SocialIcon href="https://x.com/medcover" label="MedCover on X">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href="https://instagram.com/medcover" label="MedCover on Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </SocialIcon>
              </div>
              <p className="text-xs text-[var(--color-primary-500)]">{t.footer.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
