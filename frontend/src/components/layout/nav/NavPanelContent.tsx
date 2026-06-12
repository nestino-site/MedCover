'use client'

import { getHubById, hubPath, type NavPanelId } from '@/lib/content/site-nav'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import type { getFeaturedCountriesFromTaxonomy, NavFeaturedCity } from '@/lib/content/hubs'
import {
  clinicTreatmentBrowsePath,
  compareHubPath,
  clinicsHubPath,
  countriesHubPath,
  treatmentPath,
} from '@/lib/routes'
import type { Locale, Dictionary } from '@/lib/i18n'
import {
  NAV_PREVIEW_LIMIT,
  NavCityActions,
  NavCityList,
  NavCountryActions,
  NavCountryList,
  NavFlatLink,
  NavHubCard,
  NavMicroLink,
  NavPanelTabs,
  NavSectionLabel,
  NavTreatmentChip,
  NavTreatmentRow,
  NavViewAllLink,
  type NavCityRow,
  type NavCountryRow,
} from './NavPrimitives'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

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

function formatViewAllLabel(template: string, count: number) {
  return template.replace('{count}', String(count))
}

function DestinationsContent({
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
  const tabs = [
    ...(featuredCountries.length > 0
      ? [{ id: 'countries', label: t.nav.featuredCountries, count: featuredCountries.length }]
      : []),
    ...(featuredCities.length > 0
      ? [{ id: 'cities', label: t.nav.featuredCities, count: featuredCities.length }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <NavHubCard
          hub={countriesHub}
          label={t.nav.triggers.destinations}
          locale={locale}
          onNavigate={onNavigate}
          layout="inline"
        />
        <NavMicroLink href={compareHubPath(locale)} onClick={onNavigate}>
          {t.nav.actions.compareDestinations} →
        </NavMicroLink>
      </div>

      {tabs.length > 0 && (
        <NavPanelTabs tabs={tabs}>
          {(activeTab) => (
            <div className="flex flex-col gap-2">
              {activeTab === 'countries' && featuredCountries.length > 0 && (
                <>
                  <NavCountryActions
                    countries={toCountryRows(featuredCountries)}
                    labels={t.nav.actions}
                    onNavigate={onNavigate}
                    limit={NAV_PREVIEW_LIMIT}
                  />
                  {featuredCountries.length > NAV_PREVIEW_LIMIT && (
                    <NavViewAllLink
                      href={countriesHubPath(locale)}
                      label={formatViewAllLabel(
                        t.nav.actions.viewAllCountries,
                        featuredCountries.length,
                      )}
                      onNavigate={onNavigate}
                    />
                  )}
                </>
              )}
              {activeTab === 'cities' && featuredCities.length > 0 && (
                <>
                  <NavCityActions
                    cities={toCityRows(featuredCities)}
                    labels={t.nav.actions}
                    onNavigate={onNavigate}
                    limit={NAV_PREVIEW_LIMIT}
                  />
                  {featuredCities.length > NAV_PREVIEW_LIMIT && (
                    <NavViewAllLink
                      href={browseAllCitiesHref}
                      label={formatViewAllLabel(t.nav.actions.viewAllCities, featuredCities.length)}
                      onNavigate={onNavigate}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </NavPanelTabs>
      )}
    </div>
  )
}

function ClinicsContent({
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
  const tabs = [
    ...(featuredCountries.length > 0
      ? [{ id: 'countries', label: t.nav.sections.byDestination, count: featuredCountries.length }]
      : []),
    ...(featuredCities.length > 0
      ? [{ id: 'cities', label: t.nav.sections.popularCities, count: featuredCities.length }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <NavHubCard
          hub={clinicsHub}
          label={t.nav.triggers.clinics}
          locale={locale}
          onNavigate={onNavigate}
          layout="inline"
        />
        <NavMicroLink href={clinicsHubPath(locale)} onClick={onNavigate}>
          {t.nav.actions.browseAllClinics} →
        </NavMicroLink>
      </div>

      {tabs.length > 0 && (
        <NavPanelTabs tabs={tabs}>
          {(activeTab) => (
            <div className="flex flex-col gap-2">
              {activeTab === 'countries' && featuredCountries.length > 0 && (
                <>
                  <NavCountryList
                    countries={featuredCountries.map((country) => ({
                      name: country.name,
                      flag: country.flag,
                      href: country.href,
                      clinicCount: country.clinics ? `${country.clinics} clinics` : undefined,
                    }))}
                    onNavigate={onNavigate}
                    limit={NAV_PREVIEW_LIMIT}
                  />
                  {featuredCountries.length > NAV_PREVIEW_LIMIT && (
                    <NavViewAllLink
                      href={clinicsHubPath(locale)}
                      label={formatViewAllLabel(
                        t.nav.actions.viewAllCountries,
                        featuredCountries.length,
                      )}
                      onNavigate={onNavigate}
                    />
                  )}
                </>
              )}
              {activeTab === 'cities' && featuredCities.length > 0 && (
                <>
                  <NavCityList
                    cities={featuredCities.map((city) => ({
                      cityName: city.cityName,
                      countryName: city.countryName,
                      href: city.clinicHref,
                    }))}
                    onNavigate={onNavigate}
                    limit={NAV_PREVIEW_LIMIT}
                  />
                  {featuredCities.length > NAV_PREVIEW_LIMIT && (
                    <NavViewAllLink
                      href={clinicsHubPath(locale)}
                      label={formatViewAllLabel(t.nav.actions.viewAllCities, featuredCities.length)}
                      onNavigate={onNavigate}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </NavPanelTabs>
      )}

      {activeTreatments.length > 0 && (
        <div>
          <NavSectionLabel>{t.nav.sections.byTreatment}</NavSectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {activeTreatments.map((treatment) => (
              <NavTreatmentChip
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
          </div>
        </div>
      )}
    </div>
  )
}

function TreatmentsContent({
  t,
  locale,
  treatments,
  onNavigate,
}: {
  t: Dictionary
  locale: Locale
  treatments: TreatmentCategoryDisplay[]
  onNavigate: () => void
}) {
  const treatmentsHub = getHubById('treatments')!
  const activeTreatments = treatments.filter((c) => c.status === 'active')
  const comingSoonTreatments = treatments.filter((c) => c.status === 'coming_soon')

  return (
    <div className="flex flex-col gap-3">
      <NavHubCard
        hub={treatmentsHub}
        label={t.nav.treatments}
        locale={locale}
        onNavigate={onNavigate}
        layout="inline"
      />

      {activeTreatments.length > 0 && (
        <div>
          <NavSectionLabel>{t.breadcrumb.treatments}</NavSectionLabel>
          <ul className="flex flex-col gap-0.5">
            {activeTreatments.map((treatment) => (
              <NavTreatmentRow
                key={treatment.id}
                name={treatment.name}
                treatmentHref={treatmentPath(treatment.id, locale)}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      )}

      {comingSoonTreatments.length > 0 && (
        <div>
          <NavSectionLabel>{t.nav.soon}</NavSectionLabel>
          <div className="flex flex-wrap gap-1.5 px-1">
            {comingSoonTreatments.map((treatment) => (
              <span
                key={treatment.id}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs text-[var(--color-neutral-500)]"
              >
                {treatment.name}
                <span className="rounded bg-[var(--color-neutral-100)] px-1 py-0.5 text-[9px] font-bold uppercase text-[var(--color-neutral-400)]">
                  {t.nav.soon}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ToolsContent({
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
    <div className="flex flex-wrap gap-1 sm:gap-3">
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

export function NavPanelContent({
  panelId,
  t,
  locale,
  featuredCountries,
  featuredCities,
  treatments,
  onNavigate,
}: {
  panelId: NavPanelId
  t: Dictionary
  locale: Locale
  featuredCountries: FeaturedCountry[]
  featuredCities: NavFeaturedCity[]
  treatments: TreatmentCategoryDisplay[]
  onNavigate: () => void
}) {
  switch (panelId) {
    case 'destinations':
      return (
        <DestinationsContent
          t={t}
          locale={locale}
          featuredCountries={featuredCountries}
          featuredCities={featuredCities}
          onNavigate={onNavigate}
        />
      )
    case 'clinics':
      return (
        <ClinicsContent
          t={t}
          locale={locale}
          featuredCountries={featuredCountries}
          featuredCities={featuredCities}
          treatments={treatments}
          onNavigate={onNavigate}
        />
      )
    case 'treatments':
      return <TreatmentsContent t={t} locale={locale} treatments={treatments} onNavigate={onNavigate} />
    case 'tools':
      return <ToolsContent t={t} locale={locale} onNavigate={onNavigate} />
  }
}
