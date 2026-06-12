'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import {
  HEADER_NAV,
  getHubById,
  hubPath,
  type HeaderNavItemId,
  type NavPanelId,
} from '@/lib/content/site-nav'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import {
  clinicTreatmentBrowsePath,
  compareHubPath,
  clinicsHubPath,
  countriesHubPath,
  treatmentPath,
} from '@/lib/routes'
import type { Locale, Dictionary } from '@/lib/i18n'
import type {
  getFeaturedCountriesFromTaxonomy,
  NavFeaturedCity,
} from '@/lib/content/hubs'
import {
  NavCityActions,
  NavCountryActions,
  NavCityList,
  NavCountryList,
  NavFlatLink,
  NavHubCard,
  NavMegaPanel,
  NavMicroLink,
  NavSectionLabel,
  NavTreatmentRow,
  type NavCityRow,
  type NavCountryRow,
} from './nav/NavPrimitives'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type NavMegaMenuProps = {
  locale: Locale
  t: Dictionary
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
}

const FEATURED_COUNTRY_LIMIT = 6
const FEATURED_CITY_LIMIT = 6

function toCountryRows(countries: FeaturedCountry[]): NavCountryRow[] {
  return countries.map((country) => ({
    name: country.name,
    flag: country.flag,
    countryHref: country.countryHref,
    clinicHref: country.href,
    guideHref: country.guideHref || null,
  }))
}

function toCityRows(cities: NavFeaturedCity[]): NavCityRow[] {
  return cities.map((city) => ({
    cityName: city.cityName,
    countryName: city.countryName,
    flag: city.flag,
    overviewHref: city.overviewHref,
    clinicHref: city.clinicHref,
    guideHref: city.guideHref,
  }))
}

function DestinationsPanel({
  t,
  locale,
  featuredCountries,
  featuredCities,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  onNavigate: () => void
}) {
  const countriesHub = getHubById('countries')!
  const browseAllCitiesHref = countriesHubPath(locale)

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-8">
      <div className="flex flex-col gap-3">
        <NavHubCard
          hub={countriesHub}
          label={t.nav.triggers.destinations}
          description={t.nav.descriptions.destinations}
          locale={locale}
          onNavigate={onNavigate}
          variant="nav"
        />
        <NavMicroLink href={compareHubPath(locale)} onClick={onNavigate}>
          {t.nav.actions.compareDestinations} →
        </NavMicroLink>
      </div>
      <div className="flex flex-col gap-4">
        {featuredCountries.length > 0 && (
          <div>
            <NavSectionLabel>{t.nav.featuredCountries}</NavSectionLabel>
            <NavCountryActions
              countries={toCountryRows(featuredCountries)}
              labels={t.nav.actions}
              onNavigate={onNavigate}
              limit={FEATURED_COUNTRY_LIMIT}
            />
          </div>
        )}
        {featuredCities.length > 0 && (
          <div>
            <NavSectionLabel>{t.nav.featuredCities}</NavSectionLabel>
            <NavCityActions
              cities={toCityRows(featuredCities)}
              labels={t.nav.actions}
              onNavigate={onNavigate}
              limit={FEATURED_CITY_LIMIT}
            />
            <div className="mt-2">
              <NavMicroLink href={browseAllCitiesHref} onClick={onNavigate}>
                {t.nav.actions.browseAllCities} →
              </NavMicroLink>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ClinicsPanel({
  t,
  locale,
  featuredCountries,
  featuredCities,
  treatments,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
  onNavigate: () => void
}) {
  const clinicsHub = getHubById('clinics')!
  const activeTreatments = treatments.filter((tr) => tr.status === 'active')

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-8">
      <div className="flex flex-col gap-3">
        <NavHubCard
          hub={clinicsHub}
          label={t.nav.triggers.clinics}
          description={t.nav.descriptions.clinics}
          locale={locale}
          onNavigate={onNavigate}
          variant="nav"
        />
        <NavMicroLink href={clinicsHubPath(locale)} onClick={onNavigate}>
          {t.nav.actions.browseAllClinics} →
        </NavMicroLink>
      </div>
      <div className="flex flex-col gap-4">
        {featuredCountries.length > 0 && (
          <div>
            <NavSectionLabel>{t.nav.sections.byDestination}</NavSectionLabel>
            <NavCountryList
              countries={featuredCountries.map((country) => ({
                name: country.name,
                flag: country.flag,
                href: country.href,
                clinicCount: country.clinics ? `${country.clinics} clinics` : undefined,
              }))}
              onNavigate={onNavigate}
              limit={FEATURED_COUNTRY_LIMIT}
            />
          </div>
        )}
        {featuredCities.length > 0 && (
          <div>
            <NavSectionLabel>{t.nav.sections.popularCities}</NavSectionLabel>
            <NavCityList
              cities={featuredCities.map((city) => ({
                cityName: city.cityName,
                countryName: city.countryName,
                href: city.clinicHref,
              }))}
              onNavigate={onNavigate}
              limit={FEATURED_CITY_LIMIT}
            />
          </div>
        )}
        {activeTreatments.length > 0 && (
          <div>
            <NavSectionLabel>{t.nav.sections.byTreatment}</NavSectionLabel>
            <ul className="space-y-0.5">
              {activeTreatments.map((treatment) => (
                <NavTreatmentRow
                  key={treatment.id}
                  name={treatment.name}
                  treatmentHref={clinicTreatmentBrowsePath(
                    treatment.id,
                    treatment.countries,
                    locale,
                  )}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
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
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-8">
      <NavHubCard
        hub={treatmentsHub}
        label={t.nav.treatments}
        locale={locale}
        onNavigate={onNavigate}
        variant="nav"
      />
      <div>
        {activeTreatments.length > 0 && (
          <>
            <NavSectionLabel>{t.breadcrumb.treatments}</NavSectionLabel>
            <ul className="space-y-0.5">
              {activeTreatments.map((treatment) => (
                <NavTreatmentRow
                  key={treatment.id}
                  name={treatment.name}
                  treatmentHref={treatmentPath(treatment.id, locale)}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </>
        )}
        {comingSoonTreatments.length > 0 && (
          <div className="mt-3">
            <NavSectionLabel>{t.nav.soon}</NavSectionLabel>
            <p className="px-3 text-xs text-[var(--color-neutral-400)]">
              {comingSoonTreatments.map((treatment) => treatment.name).join(' · ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ToolsPanel({
  t,
  locale,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  onNavigate: () => void
}) {
  const costsHub = getHubById('costs')!
  const compareHub = getHubById('compare')!

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
      <NavFlatLink
        href={hubPath(costsHub.id, locale)}
        label={t.nav.costs}
        onNavigate={onNavigate}
        icon={costsHub.icon}
      />
      <NavFlatLink
        href={hubPath(compareHub.id, locale)}
        label={t.nav.compare}
        onNavigate={onNavigate}
        icon={compareHub.icon}
      />
    </div>
  )
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

  const panelContent = (() => {
    if (!activePanel) return null
    switch (activePanel) {
      case 'destinations':
        return (
          <DestinationsPanel
            t={t}
            locale={locale}
            featuredCountries={featuredCountries}
            featuredCities={featuredCities}
            onNavigate={close}
          />
        )
      case 'clinics':
        return (
          <ClinicsPanel
            t={t}
            locale={locale}
            featuredCountries={featuredCountries}
            featuredCities={featuredCities}
            treatments={treatments}
            onNavigate={close}
          />
        )
      case 'treatments':
        return (
          <TreatmentsPanel t={t} locale={locale} onNavigate={close} treatments={treatments} />
        )
      case 'tools':
        return <ToolsPanel t={t} locale={locale} onNavigate={close} />
    }
  })()

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
            {panelContent}
          </NavMegaPanel>,
          panelHost,
        )}
    </div>
  )
}
