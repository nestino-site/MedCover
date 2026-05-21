import Link from 'next/link'
import { Logo } from './Logo'
import { en } from '@/lib/i18n/en'

const destinations = [
  { label: 'IVF in Spain', href: '/guides/spain-ivf-guide/' },
  { label: 'IVF in Greece', href: '/guides/greece-ivf-guide/' },
  { label: 'IVF in Czech Republic', href: '/guides/czech-republic-ivf-guide/' },
  { label: 'IVF in Turkey', href: '/guides/turkey-ivf-guide/' },
  { label: 'IVF in Portugal', href: '/guides/portugal-ivf-guide/' },
]

const resources = [
  { label: 'IVF Costs Abroad', href: '/costs/' },
  { label: 'Country Comparisons', href: '/compare/' },
  { label: 'Patient Stories', href: '/patient-stories/' },
  { label: 'IVF FAQ', href: '/faq/' },
  { label: 'Treatments Explained', href: '/treatments/' },
]

const company = [
  { label: en.footer.links.privacy, href: '/privacy/' },
  { label: en.footer.links.terms, href: '/terms/' },
  { label: en.footer.links.methodology, href: '/ai-interviewer/' },
  { label: en.footer.links.contact, href: '/contact/' },
]

export function Footer() {
  const year = 2026

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-primary-950)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Top row */}
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" aria-label="MedCover">
              <span className="text-xl font-bold tracking-tight text-white">
                Med<span className="font-normal opacity-80">Cover</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-primary-300)]">
              {en.footer.tagline}
            </p>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
              {en.footer.sections.destinations}
            </h3>
            <ul className="space-y-2.5">
              {destinations.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-primary-200)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
              {en.footer.sections.resources}
            </h3>
            <ul className="space-y-2.5">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-primary-200)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-400)]">
              {en.footer.sections.company}
            </h3>
            <ul className="space-y-2.5">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-primary-200)] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-[var(--color-primary-400)]">
            {en.footer.copyright.replace('MedCover', `${year} MedCover`)}
          </p>
          <p className="text-xs text-[var(--color-primary-500)]">
            Verified patient data. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
