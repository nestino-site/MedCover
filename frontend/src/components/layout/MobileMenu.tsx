'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { en } from '@/lib/i18n/en'
import { Logo } from './Logo'

const navLinks = [
  { label: en.nav.guides, href: '/guides/' },
  { label: en.nav.costs, href: '/costs/' },
  { label: en.nav.compare, href: '/compare/' },
  { label: en.nav.about, href: '/about/' },
  { label: en.nav.forClinics, href: '/for-clinics/' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={en.aria.openMenu}
        className="flex items-center justify-center rounded-lg p-2 text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-primary-900)] transition-colors lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-full flex-col bg-[var(--color-surface)] shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={en.aria.mainNavigation}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={en.aria.closeMenu}
            className="flex items-center justify-center rounded-lg p-2 text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label={en.aria.mainNavigation}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-[var(--color-border)] p-4">
          <Link
            href="/start/"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center rounded-xl bg-[var(--color-primary-900)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-800)] transition-colors"
          >
            {en.nav.getStarted}
          </Link>
        </div>
      </div>
    </>
  )
}
