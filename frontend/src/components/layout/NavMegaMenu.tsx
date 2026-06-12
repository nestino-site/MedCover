'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import {
  HEADER_NAV,
  hubPath,
  type HeaderNavItemId,
  type NavPanelId,
} from '@/lib/content/site-nav'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import type { Locale, Dictionary } from '@/lib/i18n'
import type {
  getFeaturedCountriesFromTaxonomy,
  NavFeaturedCity,
} from '@/lib/content/hubs'
import { NavMegaPanel } from './nav/NavPrimitives'
import { NavPanelContent } from './nav/NavPanelContent'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type NavMegaMenuProps = {
  locale: Locale
  t: Dictionary
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
}

function MegaMenuTrigger({
  itemId,
  label,
  expandLabel,
  isActive,
  onToggle,
  onOpen,
  onScheduleClose,
}: {
  itemId: HeaderNavItemId
  label: string
  expandLabel: string
  isActive: boolean
  onToggle: (id: HeaderNavItemId) => void
  onOpen: (id: HeaderNavItemId) => void
  onScheduleClose: () => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(itemId)}
      onMouseEnter={() => onOpen(itemId)}
      onMouseLeave={onScheduleClose}
      aria-expanded={isActive}
      aria-haspopup="true"
      aria-label={expandLabel}
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
          : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]'
      }`}
    >
      {label}
      <ChevronDown
        size={14}
        className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  )
}

export function NavMegaMenu({ locale, t, featuredCountries, featuredCities, treatments }: NavMegaMenuProps) {
  const [activePanel, setActivePanel] = useState<NavPanelId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [panelKey, setPanelKey] = useState(0)
  const [panelHost, setPanelHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPanelHost(document.getElementById('site-header-shell'))
  }, [])

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActivePanel(null), 300)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const openPanel = useCallback(
    (itemId: HeaderNavItemId) => {
      const item = HEADER_NAV.find((navItem) => navItem.id === itemId)
      if (!item?.panel) return
      cancelClose()
      setActivePanel((prev) => {
        if (prev !== item.panel) setPanelKey((k) => k + 1)
        return item.panel ?? null
      })
    },
    [cancelClose],
  )

  const togglePanel = useCallback(
    (itemId: HeaderNavItemId) => {
      const item = HEADER_NAV.find((navItem) => navItem.id === itemId)
      if (!item?.panel) return
      cancelClose()
      setActivePanel((prev) => {
        if (prev === item.panel) return null
        setPanelKey((k) => k + 1)
        return item.panel ?? null
      })
    },
    [cancelClose],
  )

  const close = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActivePanel(null)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setActivePanel(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={containerRef} className="relative hidden items-center gap-0.5 md:flex">
      {HEADER_NAV.map((item) => {
        const label = t.nav.triggers[item.triggerKey]

        if (item.kind === 'link') {
          return (
            <Link
              key={item.id}
              href={hubPath(item.primaryHubId, locale)}
              onClick={close}
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
            >
              {label}
            </Link>
          )
        }

        return (
          <MegaMenuTrigger
            key={item.id}
            itemId={item.id}
            label={label}
            expandLabel={t.nav.expandMenu.replace('{label}', label)}
            isActive={activePanel === item.panel}
            onToggle={togglePanel}
            onOpen={openPanel}
            onScheduleClose={scheduleClose}
          />
        )
      })}

      {activePanel &&
        panelHost &&
        createPortal(
          <NavMegaPanel
            panelRef={panelRef}
            panelKey={panelKey}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <NavPanelContent
              panelId={activePanel}
              t={t}
              locale={locale}
              featuredCountries={featuredCountries}
              featuredCities={featuredCities}
              treatments={treatments}
              onNavigate={close}
            />
          </NavMegaPanel>,
          panelHost,
        )}
    </div>
  )
}
