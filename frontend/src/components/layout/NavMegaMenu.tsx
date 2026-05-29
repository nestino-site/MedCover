'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { DIRECT_NAV_HUB_IDS, MEGA_GROUPS, getHubById, hubPath, type MegaGroupId } from '@/lib/content/site-nav'
import { treatmentCategories } from '@/lib/content/treatments'
import { localizedPath, type Locale, type Dictionary } from '@/lib/i18n'
import type { getFeaturedCountries, GuideArticleItem } from '@/lib/content/hubs'

type FeaturedCountry = ReturnType<typeof getFeaturedCountries>[number]

type NavMegaMenuProps = {
  locale: Locale
  t: Dictionary
  featuredCountries: FeaturedCountry[]
  guideArticles: GuideArticleItem[]
}

function SectionLink({
  label,
  href,
  onClick,
}: {
  label: string
  href: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-neutral-900)] hover:text-[var(--color-primary-700)]"
    >
      {label}
      <ArrowRight size={13} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  )
}

function CompactLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
    >
      {children}
    </Link>
  )
}

function DestinationsPanel({
  t,
  locale,
  featuredCountries,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  featuredCountries: FeaturedCountry[]
  onNavigate: () => void
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div>
        <SectionLink label={t.nav.countries} href={hubPath('countries', locale)} onClick={onNavigate} />
        <p className="mt-1 mb-3 text-xs text-[var(--color-neutral-500)]">{t.nav.descriptions.countries}</p>
        <div className="flex flex-wrap gap-1">
          {featuredCountries.map((c) => (
            <CompactLink key={c.href} href={c.href} onClick={onNavigate}>
              <span aria-hidden="true">{c.flag}</span>
              {c.name}
            </CompactLink>
          ))}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-4 sm:w-36 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <SectionLink label={t.nav.cities} href={hubPath('cities', locale)} onClick={onNavigate} />
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{t.nav.descriptions.cities}</p>
      </div>
    </div>
  )
}

function TreatmentsPanel({
  t,
  locale,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  onNavigate: () => void
}) {
  const activeTreatments = treatmentCategories.filter((c) => c.status === 'active')
  const comingSoonTreatments = treatmentCategories.filter((c) => c.status === 'coming_soon')

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div>
        <SectionLink label={t.nav.treatments} href={hubPath('treatments', locale)} onClick={onNavigate} />
        <p className="mt-1 mb-3 text-xs text-[var(--color-neutral-500)]">{t.nav.descriptions.treatments}</p>
        <div className="flex flex-wrap gap-1">
          {activeTreatments.map((treatment) => (
            <CompactLink
              key={treatment.id}
              href={localizedPath(`/treatments/${treatment.id}`, locale)}
              onClick={onNavigate}
            >
              {treatment.name}
            </CompactLink>
          ))}
        </div>
      </div>
      {comingSoonTreatments.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4 sm:w-36 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
            {t.nav.soon}
          </p>
          <p className="text-xs text-[var(--color-neutral-400)]">
            {comingSoonTreatments.map((treatment) => treatment.name).join(' · ')}
          </p>
        </div>
      )}
    </div>
  )
}

function GuidesPanel({
  t,
  locale,
  guideArticles,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  guideArticles: GuideArticleItem[]
  onNavigate: () => void
}) {
  return (
    <div>
      <SectionLink label={t.nav.guides} href={hubPath('guides', locale)} onClick={onNavigate} />
      <p className="mt-1 mb-3 text-xs text-[var(--color-neutral-500)]">{t.nav.descriptions.guides}</p>
      {guideArticles.length > 0 ? (
        <ul className="grid gap-0.5 sm:grid-cols-2">
          {guideArticles.map((article) => (
            <li key={article.href}>
              <Link
                href={article.href}
                onClick={onNavigate}
                className="block truncate rounded-md px-2 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--color-neutral-400)]">{t.hubs.guides.empty}</p>
      )}
    </div>
  )
}

export function NavMegaMenu({ locale, t, featuredCountries, guideArticles }: NavMegaMenuProps) {
  const [activeGroup, setActiveGroup] = useState<MegaGroupId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [panelKey, setPanelKey] = useState(0)

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveGroup(null), 300)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const openGroup = useCallback(
    (id: MegaGroupId) => {
      cancelClose()
      setActiveGroup((prev) => {
        if (prev !== id) setPanelKey((k) => k + 1)
        return id
      })
    },
    [cancelClose],
  )

  const close = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveGroup(null)
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
      setActiveGroup(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const panelContent = (() => {
    if (!activeGroup) return null
    switch (activeGroup) {
      case 'destinations':
        return (
          <DestinationsPanel
            t={t}
            locale={locale}
            featuredCountries={featuredCountries}
            onNavigate={close}
          />
        )
      case 'treatments':
        return <TreatmentsPanel t={t} locale={locale} onNavigate={close} />
      case 'guides':
        return (
          <GuidesPanel t={t} locale={locale} guideArticles={guideArticles} onNavigate={close} />
        )
    }
  })()

  return (
    <div ref={containerRef} className="relative hidden items-center gap-0.5 md:flex">
      {MEGA_GROUPS.map((group) => {
        const isActive = activeGroup === group.id
        return (
          <button
            key={group.id}
            type="button"
            onMouseEnter={() => openGroup(group.id)}
            onMouseLeave={scheduleClose}
            onClick={() => (isActive ? close() : openGroup(group.id))}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
              isActive
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-800)]'
                : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]'
            }`}
            aria-expanded={isActive}
            aria-haspopup="true"
          >
            {t.nav.triggers[group.id]}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        )
      })}

      {DIRECT_NAV_HUB_IDS.map((hubId) => {
        const hub = getHubById(hubId)
        return (
          <Link
            key={hubId}
            href={hubPath(hubId, locale)}
            onClick={close}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)] lg:px-4"
          >
            {t.nav[hubId]}
            {hub?.status === 'coming_soon' && (
              <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-neutral-400)]">
                {t.nav.soon}
              </span>
            )}
          </Link>
        )
      })}

      {activeGroup && (
        <div
          ref={panelRef}
          key={panelKey}
          className="mega-panel-enter absolute left-0 top-full z-50 mt-2 w-[520px] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-lg)]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          role="menu"
        >
          {panelContent}
        </div>
      )}
    </div>
  )
}
