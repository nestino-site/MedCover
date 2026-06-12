'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronDown, Menu, X, type LucideIcon } from 'lucide-react'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import type { getFeaturedCountriesFromTaxonomy, NavFeaturedCity } from '@/lib/content/hubs'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import {
  FOOTER_INFO_LINKS,
  getHubById,
  getMegaNavItems,
  getLinkNavItems,
  hubPath,
  MOBILE_QUICK_LINKS,
  type NavPanelId,
  type SiteHub,
} from '@/lib/content/site-nav'
import { compareHubPath, costTreatmentPath, countriesHubPath, treatmentPath } from '@/lib/routes'
import { SearchTriggerButton } from '@/components/search/SearchModal'
import {
  NavCountryActions,
  NavCityActions,
  NavCityPlps,
  NavHubCard,
  NavSectionLabel,
  NavTreatmentRow,
  NavMicroLink,
  type NavCountryRow,
  type NavCityRow,
} from './nav/NavPrimitives'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type MobileMenuProps = {
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
}

const FEATURED_COUNTRY_LIMIT = 6
const FEATURED_CITY_LIMIT = 8

function toCountryRows(countries: FeaturedCountry[]): NavCountryRow[] {
  return countries.map((c) => ({
    name: c.name,
    flag: c.flag,
    countryHref: c.countryHref,
    clinicHref: c.href,
    guideHref: c.guideHref || null,
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
    <div className="rounded-xl border border-[var(--color-border)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold text-[var(--color-neutral-800)]"
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-[var(--color-neutral-400)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="border-t border-[var(--color-border)] px-3 pb-3 pt-2">{children}</div>}
    </div>
  )
}

function MobileHubItem({
  hub,
  label,
  locale,
  description,
  onNavigate,
}: {
  hub: SiteHub
  label: string
  locale: Locale
  description: string
  onNavigate: () => void
}) {
  const Icon: LucideIcon = hub.icon
  return (
    <Link
      href={hubPath(hub.id, locale)}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--color-primary-50)]"
    >
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-[var(--color-neutral-800)]">{label}</span>
        <span className="text-xs leading-relaxed text-[var(--color-neutral-500)]">{description}</span>
      </span>
    </Link>
  )
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
  const browseAllCitiesHref = `${countriesHubPath(locale)}#cities`

  switch (panelId) {
    case 'destinations': {
      const countriesHub = getHubById('countries')!
      return (
        <div className="space-y-3">
          <NavHubCard
            hub={countriesHub}
            label={t.nav.triggers.destinations}
            description={t.nav.descriptions.destinations}
            locale={locale}
            onNavigate={onNavigate}
            compact
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
        <div className="space-y-3">
          <NavHubCard
            hub={clinicsHub}
            label={t.nav.clinics}
            description={t.nav.descriptions.clinics}
            locale={locale}
            onNavigate={onNavigate}
            compact
          />
          {cities.length > 0 && (
            <>
              <NavSectionLabel>{t.nav.featuredCities}</NavSectionLabel>
              <NavCityPlps
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
        </div>
      )
    }
    case 'treatments': {
      const treatmentsHub = getHubById('treatments')!
      return (
        <div className="space-y-3">
          <NavHubCard
            hub={treatmentsHub}
            label={t.nav.treatments}
            description={t.nav.descriptions.treatments}
            locale={locale}
            onNavigate={onNavigate}
            compact
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
                    costHref={costTreatmentPath(treatment.id, locale)}
                    costLabel={t.nav.actions.costs}
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
        <div className="grid gap-2">
          <NavHubCard
            hub={costsHub}
            label={t.nav.costs}
            description={t.nav.descriptions.costs}
            locale={locale}
            onNavigate={onNavigate}
            compact
          />
          <NavHubCard
            hub={compareHub}
            label={t.nav.compare}
            description={t.nav.descriptions.compare}
            locale={locale}
            onNavigate={onNavigate}
            compact
          />
        </div>
      )
    }
  }
}

function quickLinkLabel(
  hubId: (typeof MOBILE_QUICK_LINKS)[number],
  t: ReturnType<typeof getDictionary>,
): string {
  switch (hubId) {
    case 'countries':
      return t.nav.quickLinks.destinations
    case 'clinics':
      return t.nav.quickLinks.clinics
    case 'costs':
      return t.nav.quickLinks.costs
    case 'compare':
      return t.nav.quickLinks.compare
    case 'guides':
      return t.nav.quickLinks.guides
    default:
      return t.nav[hubId]
  }
}

export function MobileMenu({ locale, featuredCountries, featuredCities, treatments }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [expandedPanel, setExpandedPanel] = useState<NavPanelId | null>('destinations')
  const t = getDictionary(locale)
  const close = () => setOpen(false)

  const megaItems = getMegaNavItems()

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
          className="mobile-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-[var(--color-surface)] shadow-xl outline-none md:hidden"
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

          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <SearchTriggerButton className="w-full justify-start" />
          </div>

          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {MOBILE_QUICK_LINKS.map((hubId) => (
                <Link
                  key={hubId}
                  href={hubPath(hubId, locale)}
                  onClick={close}
                  className="rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                >
                  {quickLinkLabel(hubId, t)}
                </Link>
              ))}
            </div>
          </div>

          <nav
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            aria-label={t.aria.mainNavigation}
          >
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

            {getLinkNavItems().map((item) => {
              const hub = getHubById(item.primaryHubId)
              if (!hub) return null
              return (
                <MobileHubItem
                  key={item.id}
                  hub={hub}
                  label={t.nav.triggers[item.triggerKey]}
                  locale={locale}
                  description={t.nav.descriptions[hub.labelKey]}
                  onNavigate={close}
                />
              )
            })}

            <div>
              <NavSectionLabel>{t.nav.groups.info}</NavSectionLabel>
              <div className="flex flex-col gap-0.5">
                {FOOTER_INFO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={localizedPath(link.href.replace(/\/$/, ''), locale)}
                    onClick={close}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                  >
                    {t.nav[link.key]}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
