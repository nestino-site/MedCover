'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, type LucideIcon } from 'lucide-react'
import {
  DIRECT_NAV_HUB_IDS,
  MEGA_GROUPS,
  getHubById,
  hubPath,
  type HubId,
  type MegaGroupId,
  type SiteHub,
} from '@/lib/content/site-nav'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import { clinicCountryTreatmentPath, treatmentPath } from '@/lib/routes'
import { localizedPath, type Locale, type Dictionary } from '@/lib/i18n'
import type { getFeaturedCountriesFromTaxonomy, GuideCountryGroup } from '@/lib/content/hubs'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type NavMegaMenuProps = {
  locale: Locale
  t: Dictionary
  featuredCountries: FeaturedCountry[]
  guideGroups: GuideCountryGroup[]
  treatments: TreatmentCategoryDisplay[]
}

function HubCardLink({
  hub,
  label,
  description,
  locale,
  onNavigate,
  badge,
}: {
  hub: SiteHub
  label: string
  description: string
  locale: Locale
  onNavigate: () => void
  badge?: string
}) {
  const Icon: LucideIcon = hub.icon
  return (
    <Link
      href={hubPath(hub.id, locale)}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-50)]/60 p-3 transition-all hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:shadow-sm"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-primary-700)] shadow-sm ring-1 ring-[var(--color-border)]">
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-800)]">
            {label}
          </span>
          {badge && (
            <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
              {badge}
            </span>
          )}
          <ArrowRight
            size={14}
            className="ml-auto flex-shrink-0 text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden="true"
          />
        </span>
        <span className="text-xs leading-relaxed text-[var(--color-neutral-500)]">{description}</span>
      </span>
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

function PanelSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
      {children}
    </p>
  )
}

function countryKeyFromFeatured(c: FeaturedCountry): string {
  return c.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
}

function ClinicsPanel({
  t,
  locale,
  featuredCountries,
  treatments,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  featuredCountries: FeaturedCountry[]
  treatments: TreatmentCategoryDisplay[]
  onNavigate: () => void
}) {
  const clinicsHub = getHubById('clinics')!
  const activeTreatments = treatments.filter((c) => c.status === 'active')

  return (
    <div className="flex flex-col gap-4">
      <HubCardLink
        hub={clinicsHub}
        label={t.nav.clinics}
        description={t.nav.descriptions.clinics}
        locale={locale}
        onNavigate={onNavigate}
      />
      {featuredCountries.length > 0 && (
        <div>
          <PanelSectionLabel>{t.nav.countries}</PanelSectionLabel>
          <div className="flex flex-wrap gap-1">
            {featuredCountries.map((c) => (
              <CompactLink key={c.href} href={c.href} onClick={onNavigate}>
                <span aria-hidden="true">{c.flag}</span>
                {c.name}
              </CompactLink>
            ))}
          </div>
        </div>
      )}
      {activeTreatments.map((treatment) => {
        const treatmentCountries = featuredCountries.filter((c) =>
          treatment.countries.includes(countryKeyFromFeatured(c)),
        )
        if (treatmentCountries.length === 0) return null
        return (
          <div key={treatment.id}>
            <PanelSectionLabel>{treatment.name}</PanelSectionLabel>
            <div className="flex flex-wrap gap-1">
              {treatmentCountries.map((c) => {
                const countryKey = countryKeyFromFeatured(c)
                return (
                  <CompactLink
                    key={`${treatment.id}-${countryKey}`}
                    href={clinicCountryTreatmentPath(countryKey, treatment.id, locale)}
                    onClick={onNavigate}
                  >
                    <span aria-hidden="true">{c.flag}</span>
                    {c.name}
                  </CompactLink>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
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
  const countriesHub = getHubById('countries')!

  return (
    <div className="flex flex-col gap-4">
      <HubCardLink
        hub={countriesHub}
        label={t.nav.countries}
        description={t.nav.descriptions.countries}
        locale={locale}
        onNavigate={onNavigate}
      />
      {featuredCountries.length > 0 && (
        <div>
          <PanelSectionLabel>{t.nav.groups.destinations}</PanelSectionLabel>
          <div className="flex flex-wrap gap-1">
            {featuredCountries.map((c) => (
              <CompactLink key={c.countryHref} href={c.countryHref} onClick={onNavigate}>
                <span aria-hidden="true">{c.flag}</span>
                {c.name}
              </CompactLink>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TreatmentsPanel({
  t,
  locale,
  onNavigate,
  treatments,
}: {
  t: Dictionary
  locale: Locale
  onNavigate: () => void
  treatments: TreatmentCategoryDisplay[]
}) {
  const treatmentsHub = getHubById('treatments')!
  const activeTreatments = treatments.filter((c) => c.status === 'active')
  const comingSoonTreatments = treatments.filter((c) => c.status === 'coming_soon')

  return (
    <div className="flex flex-col gap-4">
      <HubCardLink
        hub={treatmentsHub}
        label={t.nav.treatments}
        description={t.nav.descriptions.treatments}
        locale={locale}
        onNavigate={onNavigate}
      />
      {activeTreatments.length > 0 && (
        <div>
          <PanelSectionLabel>{t.breadcrumb.treatments}</PanelSectionLabel>
          <div className="flex flex-wrap gap-1">
            {activeTreatments.map((treatment) => (
              <CompactLink
                key={treatment.id}
                href={treatmentPath(treatment.id, locale)}
                onClick={onNavigate}
              >
                {treatment.name}
              </CompactLink>
            ))}
          </div>
        </div>
      )}
      {comingSoonTreatments.length > 0 && (
        <div>
          <PanelSectionLabel>{t.nav.soon}</PanelSectionLabel>
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
  guideGroups,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  guideGroups: GuideCountryGroup[]
  onNavigate: () => void
}) {
  const guidesHub = getHubById('guides')!

  return (
    <div className="flex flex-col gap-4">
      <HubCardLink
        hub={guidesHub}
        label={t.nav.guides}
        description={t.nav.descriptions.guides}
        locale={locale}
        onNavigate={onNavigate}
      />
      {guideGroups.length > 0 ? (
        <div className="max-h-[min(24rem,60vh)] space-y-3 overflow-y-auto pr-1">
          <PanelSectionLabel>{t.nav.guides}</PanelSectionLabel>
          {guideGroups.map((group) => (
            <div key={group.countryKey}>
              <div className="mb-1 flex items-center gap-1.5 px-2">
                <span className="text-sm leading-none" role="img" aria-hidden="true">
                  {group.flag}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
                  {group.countryName}
                </span>
              </div>
              <ul className="space-y-0.5">
                {group.countryGuide && (
                  <li>
                    <Link
                      href={group.countryGuide.href}
                      onClick={onNavigate}
                      className="block rounded-md px-2 py-1.5 transition-colors hover:bg-[var(--color-primary-50)]"
                    >
                      <span className="block text-xs font-semibold text-[var(--color-neutral-800)] hover:text-[var(--color-primary-800)]">
                        {group.countryGuide.title}
                      </span>
                      {group.countryGuide.description && (
                        <span className="mt-0.5 block line-clamp-1 text-[10px] leading-snug text-[var(--color-neutral-500)]">
                          {group.countryGuide.description}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
                {group.cityGuides.map((city) => (
                  <li key={city.href}>
                    <Link
                      href={city.href}
                      onClick={onNavigate}
                      className="block truncate rounded-md px-2 py-1 text-xs font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                    >
                      {city.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--color-neutral-400)]">{t.hubs.guides.empty}</p>
      )}
    </div>
  )
}

function MegaMenuTrigger({
  groupId,
  primaryHubId,
  label,
  expandLabel,
  locale,
  isActive,
  onOpen,
  onClose,
  onScheduleClose,
}: {
  groupId: MegaGroupId
  primaryHubId: HubId
  label: string
  expandLabel: string
  locale: Locale
  isActive: boolean
  onOpen: (id: MegaGroupId) => void
  onClose: () => void
  onScheduleClose: () => void
}) {
  return (
    <div
      className={`inline-flex items-stretch rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary-100)]'
          : 'hover:bg-[var(--color-primary-50)]'
      }`}
      onMouseEnter={() => onOpen(groupId)}
      onMouseLeave={onScheduleClose}
    >
      <Link
        href={hubPath(primaryHubId, locale)}
        onClick={onClose}
        className={`inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-medium lg:pl-4 lg:pr-2 ${
          isActive
            ? 'text-[var(--color-primary-800)]'
            : 'text-[var(--color-neutral-600)] hover:text-[var(--color-primary-800)]'
        }`}
      >
        {label}
      </Link>
      <button
        type="button"
        onClick={() => (isActive ? onClose() : onOpen(groupId))}
        aria-expanded={isActive}
        aria-haspopup="true"
        aria-label={expandLabel}
        className={`inline-flex items-center rounded-r-lg px-1.5 py-2 lg:pr-3 ${
          isActive
            ? 'text-[var(--color-primary-700)]'
            : 'text-[var(--color-neutral-500)] hover:text-[var(--color-primary-800)]'
        }`}
      >
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

export function NavMegaMenu({ locale, t, featuredCountries, guideGroups, treatments }: NavMegaMenuProps) {
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
      case 'clinics':
        return (
          <ClinicsPanel
            t={t}
            locale={locale}
            featuredCountries={featuredCountries}
            treatments={treatments}
            onNavigate={close}
          />
        )
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
        return <TreatmentsPanel t={t} locale={locale} onNavigate={close} treatments={treatments} />
      case 'guides':
        return (
          <GuidesPanel t={t} locale={locale} guideGroups={guideGroups} onNavigate={close} />
        )
    }
  })()

  return (
    <div ref={containerRef} className="relative hidden items-center gap-0.5 md:flex">
      {MEGA_GROUPS.map((group) => (
        <MegaMenuTrigger
          key={group.id}
          groupId={group.id}
          primaryHubId={group.primaryHubId}
          label={t.nav.triggers[group.id]}
          expandLabel={t.nav.expandMenu.replace('{label}', t.nav.triggers[group.id])}
          locale={locale}
          isActive={activeGroup === group.id}
          onOpen={openGroup}
          onClose={close}
          onScheduleClose={scheduleClose}
        />
      ))}

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
          className="mega-panel-enter absolute left-0 top-full z-50 mt-2 w-[540px] max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-lg)]"
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
