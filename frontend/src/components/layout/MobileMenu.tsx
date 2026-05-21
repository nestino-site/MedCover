'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import { getFeaturedCountries } from '@/lib/content/hubs'
import {
  getExploreHubs,
  getHeaderMoreHubs,
  hubPath,
} from '@/lib/content/site-nav'

type MobileMenuProps = {
  locale: Locale
}

function NavGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
        {title}
      </p>
      {children}
    </div>
  )
}

function NavLink({
  href,
  label,
  onNavigate,
  badge,
}: {
  href: string
  label: string
  onNavigate: () => void
  badge?: string
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between rounded-lg px-4 py-3.5 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
    >
      <span>{label}</span>
      {badge && (
        <span className="text-[10px] font-semibold uppercase text-[var(--color-neutral-400)]">{badge}</span>
      )}
    </Link>
  )
}

export function MobileMenu({ locale }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const t = getDictionary(locale)
  const close = () => setOpen(false)

  const destinationHubs = getExploreHubs().filter((h) => h.group === 'destinations')
  const contentHubs = getExploreHubs().filter(
    (h) => h.group === 'treatments' || h.group === 'content',
  )
  const toolHubs = getHeaderMoreHubs()
  const featured = getFeaturedCountries(locale).slice(0, 5)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t.aria.openMenu}
          className="flex items-center justify-center rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-primary-900)] md:hidden"
        >
          <Menu size={20} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-xl outline-none md:hidden"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between bg-[var(--color-primary-950)] px-6 py-4">
            <Dialog.Title className="text-sm font-semibold text-white">{t.nav.menu}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t.aria.closeMenu}
                className="flex items-center justify-center rounded-lg p-2 text-[var(--color-primary-300)] transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label={t.aria.mainNavigation}>
            <NavGroup title={t.nav.groups.destinations}>
              {destinationHubs.map((hub) => (
                <NavLink
                  key={hub.id}
                  href={hubPath(hub.id, locale)}
                  label={t.nav[hub.labelKey]}
                  onNavigate={close}
                />
              ))}
            </NavGroup>

            <div className="mt-4">
              <NavGroup title={t.nav.groups.treatmentsContent}>
                {contentHubs.map((hub) => (
                  <NavLink
                    key={hub.id}
                    href={hubPath(hub.id, locale)}
                    label={t.nav[hub.labelKey]}
                    onNavigate={close}
                    badge={hub.status === 'coming_soon' ? t.nav.soon : undefined}
                  />
                ))}
              </NavGroup>
            </div>

            <div className="mt-4">
              <NavGroup title={t.nav.groups.tools}>
                {toolHubs.map((hub) => (
                  <NavLink
                    key={hub.id}
                    href={hubPath(hub.id, locale)}
                    label={t.nav[hub.labelKey]}
                    onNavigate={close}
                    badge={t.nav.soon}
                  />
                ))}
              </NavGroup>
            </div>

            <div className="mt-4">
              <NavGroup title={t.nav.groups.featuredIvf}>
                {featured.map((dest) => (
                  <NavLink
                    key={dest.href}
                    href={dest.href}
                    label={`${t.home.ivfSpotlight.ivfIn} ${dest.name}`}
                    onNavigate={close}
                  />
                ))}
              </NavGroup>
            </div>

            <div className="mt-4">
              <NavGroup title={t.nav.groups.info}>
                <NavLink
                  href={localizedPath('/about', locale)}
                  label={t.nav.about}
                  onNavigate={close}
                />
              </NavGroup>
            </div>
          </nav>

          <div className="border-t border-[var(--color-border)] p-4">
            <Link
              href={hubPath('clinics', locale)}
              onClick={close}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-900)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
            >
              {t.nav.matchClinic}
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {t.nav.soon}
              </span>
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
