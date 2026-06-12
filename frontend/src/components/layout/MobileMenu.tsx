'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronDown, Menu, X } from 'lucide-react'
import { getDictionary, type Locale } from '@/lib/i18n'
import type { getFeaturedCountriesFromTaxonomy, NavFeaturedCity } from '@/lib/content/hubs'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import {
  getHubById,
  getLinkNavItems,
  getMegaNavItems,
  hubPath,
  type NavPanelId,
} from '@/lib/content/site-nav'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import { NavFlatLink } from './nav/NavPrimitives'
import { NavPanelContent } from './nav/NavPanelContent'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type MobileMenuProps = {
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[var(--color-neutral-800)]"
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-[var(--color-neutral-400)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export function MobileMenu({ locale, featuredCountries, featuredCities, treatments }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [expandedPanel, setExpandedPanel] = useState<NavPanelId | null>(null)
  const t = getDictionary(locale)
  const close = () => setOpen(false)

  const megaItems = getMegaNavItems().filter((item) => item.id !== 'tools')
  const linkItems = getLinkNavItems()
  const costsHub = getHubById('costs')!
  const compareHub = getHubById('compare')!

  const togglePanel = (panelId: NavPanelId) => {
    setExpandedPanel((prev) => (prev === panelId ? null : panelId))
  }

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
        <Dialog.Overlay className="mobile-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" />
        <Dialog.Content
          className="mobile-drawer safe-area-bottom fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-xl outline-none md:hidden"
          aria-describedby={undefined}
        >
          <div className="safe-area-top flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-primary-950)] px-4 py-3">
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

          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <SearchTriggerButton className="w-full justify-start" />
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto" aria-label={t.aria.mainNavigation}>
            {megaItems.map((item) => {
              if (!item.panel) return null
              return (
                <AccordionSection
                  key={item.id}
                  title={t.nav.triggers[item.triggerKey]}
                  open={expandedPanel === item.panel}
                  onToggle={() => togglePanel(item.panel!)}
                >
                  <NavPanelContent
                    panelId={item.panel}
                    t={t}
                    locale={locale}
                    featuredCountries={featuredCountries}
                    featuredCities={featuredCities}
                    treatments={treatments}
                    onNavigate={close}
                  />
                </AccordionSection>
              )
            })}

            {linkItems.map((item) => {
              const hub = getHubById(item.primaryHubId)
              if (!hub) return null
              return (
                <Link
                  key={item.id}
                  href={hubPath(hub.id, locale)}
                  onClick={close}
                  className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-neutral-800)] transition-colors hover:bg-[var(--color-primary-50)]"
                >
                  <hub.icon size={16} className="text-[var(--color-primary-700)]" aria-hidden="true" />
                  {t.nav.triggers[item.triggerKey]}
                </Link>
              )
            })}

            <div className="border-b border-[var(--color-border)] px-2 py-1">
              <p className="px-2 py-2 text-xs font-semibold text-[var(--color-neutral-500)]">
                {t.nav.groups.tools}
              </p>
              <NavFlatLink
                href={hubPath(costsHub.id, locale)}
                label={t.nav.costs}
                onNavigate={close}
                icon={costsHub.icon}
              />
              <NavFlatLink
                href={hubPath(compareHub.id, locale)}
                label={t.nav.compare}
                onNavigate={close}
                icon={compareHub.icon}
              />
            </div>
          </nav>

          <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <Link
              href={hubPath('clinics', locale)}
              onClick={close}
              className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary-800)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
            >
              {t.nav.matchClinic}
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
