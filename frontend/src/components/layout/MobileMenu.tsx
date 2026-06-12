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
import {
  clinicTreatmentBrowsePath,
  compareHubPath,
  clinicsHubPath,
  countriesHubPath,
  treatmentPath,
} from '@/lib/routes'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import {
  NavCityActions,
  NavCountryActions,
  NavCityList,
  NavCountryList,
  NavFlatLink,
  NavHubCard,
  NavMicroLink,
  NavSectionLabel,
  NavTreatmentRow,
  type NavCityRow,
  type NavCountryRow,
} from './nav/NavPrimitives'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type MobileMenuProps = {
  locale: Locale
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

function MobilePanelContent({
  panelId,
  t,
  locale,
  featuredCountries,
  featuredCities,
  treatments,
  onNavigate,
}: {
  panelId: NavPanelId
  t: ReturnType<typeof getDictionary>
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
  onNavigate: () => void
}) {
  const featured = featuredCountries.slice(0, FEATURED_COUNTRY_LIMIT)
  const cities = featuredCities.slice(0, FEATURED_CITY_LIMIT)
  const activeTreatments = treatments.filter((tr) => tr.status === 'active')
  const browseAllCitiesHref = countriesHubPath(locale)

  switch (panelId) {
    case 'destinations': {
      const countriesHub = getHubById('countries')!
      return (
        <div className="space-y-4">
          <NavHubCard
            hub={countriesHub}
            label={t.nav.triggers.destinations}
            description={t.nav.descriptions.destinations}
            locale={locale}
            onNavigate={onNavigate}
            variant="nav"
          />
          {featured.length > 0 && (
            <>
              <NavSectionLabel>{t.nav.featuredCountries}</NavSectionLabel>
              <NavCountryActions
                countries={toCountryRows(featured)}
                labels={t.nav.actions}
                onNavigate={onNavigate}
                limit={FEATURED_COUNTRY_LIMIT}
              />
            </>
          )}
          {cities.length > 0 && (
            <>
              <NavSectionLabel>{t.nav.featuredCities}</NavSectionLabel>
              <NavCityActions
                cities={toCityRows(cities)}
                labels={t.nav.actions}
                onNavigate={onNavigate}
                limit={FEATURED_CITY_LIMIT}
              />
              <NavMicroLink href={browseAllCitiesHref} onClick={onNavigate}>
                {t.nav.actions.browseAllCities} →
              </NavMicroLink>
            </>
          )}
          <NavMicroLink href={compareHubPath(locale)} onClick={onNavigate}>
            {t.nav.actions.compareDestinations} →
          </NavMicroLink>
        </div>
      )
    }
    case 'clinics': {
      const clinicsHub = getHubById('clinics')!
      return (
        <div className="space-y-4">
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
          {featured.length > 0 && (
            <>
              <NavSectionLabel>{t.nav.sections.byDestination}</NavSectionLabel>
              <NavCountryList
                countries={featured.map((country) => ({
                  name: country.name,
                  flag: country.flag,
                  href: country.href,
                  clinicCount: country.clinics ? `${country.clinics} clinics` : undefined,
                }))}
                onNavigate={onNavigate}
                limit={FEATURED_COUNTRY_LIMIT}
              />
            </>
          )}
          {cities.length > 0 && (
            <>
              <NavSectionLabel>{t.nav.sections.popularCities}</NavSectionLabel>
              <NavCityList
                cities={cities.map((city) => ({
                  cityName: city.cityName,
                  countryName: city.countryName,
                  href: city.clinicHref,
                }))}
                onNavigate={onNavigate}
                limit={FEATURED_CITY_LIMIT}
              />
            </>
          )}
          {activeTreatments.length > 0 && (
            <>
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
            </>
          )}
        </div>
      )
    }
    case 'treatments': {
      const treatmentsHub = getHubById('treatments')!
      return (
        <div className="space-y-4">
          <NavHubCard
            hub={treatmentsHub}
            label={t.nav.treatments}
            locale={locale}
            onNavigate={onNavigate}
            variant="nav"
          />
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
        </div>
      )
    }
    case 'tools': {
      const costsHub = getHubById('costs')!
      const compareHub = getHubById('compare')!
      return (
        <div className="flex flex-col gap-0.5">
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
  }
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
                  <MobilePanelContent
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
