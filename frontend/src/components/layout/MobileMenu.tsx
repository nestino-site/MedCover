'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X, type LucideIcon } from 'lucide-react'
import { getDictionary, localizedPath, type Locale } from '@/lib/i18n'
import type { getFeaturedCountriesFromTaxonomy, GuideCountryGroup } from '@/lib/content/hubs'
import type { TreatmentCategoryDisplay } from '@/lib/content/treatments'
import { DIRECT_NAV_HUB_IDS, MEGA_GROUPS, SITE_HUBS, hubPath, type SiteHub } from '@/lib/content/site-nav'
import { clinicCountryTreatmentPath, treatmentPath } from '@/lib/routes'
import { SearchTriggerButton } from '@/components/search/SearchModal'

type FeaturedCountry = ReturnType<typeof getFeaturedCountriesFromTaxonomy>[number]

type MobileMenuProps = {
  locale: Locale
  guideGroups: GuideCountryGroup[]
  featuredCountries: FeaturedCountry[]
  treatments: TreatmentCategoryDisplay[]
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
      {children}
    </p>
  )
}

function SectionHubLink({
  href,
  label,
  browseLabel,
  onNavigate,
}: {
  href: string
  label: string
  browseLabel: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group mb-1.5 flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--color-primary-50)]"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-500)] group-hover:text-[var(--color-primary-800)]">
        {label}
      </span>
      <span className="text-[10px] font-medium text-[var(--color-primary-600)] opacity-0 transition-opacity group-hover:opacity-100">
        {browseLabel} →
      </span>
    </Link>
  )
}

function HubItem({
  hub,
  label,
  locale,
  description,
  onNavigate,
  badge,
}: {
  hub: SiteHub
  label: string
  locale: Locale
  description: string
  onNavigate: () => void
  badge?: string
}) {
  const Icon: LucideIcon = hub.icon
  return (
    <Link
      href={hubPath(hub.id, locale)}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--color-primary-50)]"
    >
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-neutral-800)]">{label}</span>
          {badge && (
            <span className="rounded-full bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
              {badge}
            </span>
          )}
        </span>
        <span className="text-xs leading-relaxed text-[var(--color-neutral-500)]">
          {description}
        </span>
      </span>
    </Link>
  )
}

function countryKeyFromFeatured(c: FeaturedCountry): string {
  return c.slug.replace(/^guides\//, '').replace(/-ivf-guide$/, '')
}

export function MobileMenu({ locale, guideGroups, featuredCountries, treatments }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const t = getDictionary(locale)
  const close = () => setOpen(false)

  const featured = featuredCountries.slice(0, 6)
  const activeTreatments = treatments.filter((tr) => tr.status === 'active')

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

          <nav
            className="flex flex-1 flex-col gap-5 overflow-y-auto p-4"
            aria-label={t.aria.mainNavigation}
          >
            {MEGA_GROUPS.map((group) => {
              const allHubIds = [group.primaryHubId, ...group.relatedHubIds]
              const hubs = allHubIds
                .map((id) => SITE_HUBS.find((h) => h.id === id))
                .filter((h) => h !== undefined)
                .filter((hub) => group.relatedHubIds.length > 0 || hub.id !== group.primaryHubId)

              const primaryHub = SITE_HUBS.find((h) => h.id === group.primaryHubId)
              const showAsCard = group.id === 'clinics' || group.id === 'destinations'

              return (
                <div key={group.id}>
                  {showAsCard && primaryHub ? (
                    <HubItem
                      hub={primaryHub}
                      label={t.nav[primaryHub.labelKey]}
                      locale={locale}
                      description={t.nav.descriptions[primaryHub.labelKey]}
                      onNavigate={close}
                    />
                  ) : group.relatedHubIds.length === 0 ? (
                    <SectionHubLink
                      href={hubPath(group.primaryHubId, locale)}
                      label={t.nav.triggers[group.id]}
                      browseLabel={t.nav.browseHub}
                      onNavigate={close}
                    />
                  ) : (
                    <SectionTitle>{t.nav.triggers[group.id]}</SectionTitle>
                  )}
                  <div className="flex flex-col">
                    {hubs.map((hub) => (
                      <HubItem
                        key={hub.id}
                        hub={hub}
                        label={t.nav[hub.labelKey]}
                        locale={locale}
                        description={t.nav.descriptions[hub.labelKey]}
                        onNavigate={close}
                        badge={hub.status === 'coming_soon' ? t.nav.soon : undefined}
                      />
                    ))}
                  </div>

                  {group.id === 'guides' && guideGroups.length > 0 && (
                    <div className="mt-2 space-y-3 px-3">
                      {guideGroups.map((countryGroup) => (
                        <div key={countryGroup.countryKey}>
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="text-base leading-none" role="img" aria-hidden="true">
                              {countryGroup.flag}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                              {countryGroup.countryName}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {countryGroup.countryGuide && (
                              <Link
                                href={countryGroup.countryGuide.href}
                                onClick={close}
                                className="rounded-lg px-2.5 py-2 transition-colors hover:bg-[var(--color-primary-50)]"
                              >
                                <span className="block text-sm font-semibold text-[var(--color-neutral-800)]">
                                  {countryGroup.countryGuide.title}
                                </span>
                                {countryGroup.countryGuide.description && (
                                  <span className="mt-0.5 block line-clamp-2 text-xs text-[var(--color-neutral-500)]">
                                    {countryGroup.countryGuide.description}
                                  </span>
                                )}
                              </Link>
                            )}
                            {countryGroup.cityGuides.map((city) => (
                              <Link
                                key={city.href}
                                href={city.href}
                                onClick={close}
                                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                              >
                                {city.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.id === 'treatments' && (
                    <div className="mt-2 px-3">
                      <div className="flex flex-wrap gap-1.5">
                        {treatments.map((treatment) => {
                          const isActive = treatment.status === 'active'
                          const href = isActive
                            ? treatmentPath(treatment.id, locale)
                            : hubPath('treatments', locale)

                          return (
                            <Link
                              key={treatment.id}
                              href={href}
                              onClick={close}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                  ? 'border-[var(--color-accent-200)] bg-[var(--color-accent-50)] text-[var(--color-accent-800)] hover:bg-[var(--color-accent-100)]'
                                  : 'border-[var(--color-border)] text-[var(--color-neutral-400)]'
                              }`}
                              aria-disabled={!isActive}
                            >
                              {treatment.name}
                              {!isActive && (
                                <span className="text-[9px] font-bold uppercase tracking-wide">
                                  {t.nav.soon}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {group.id === 'destinations' && featured.length > 0 && (
                    <div className="mt-2 px-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                        {t.nav.groups.featuredIvf}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {featured.map((dest) => (
                          <Link
                            key={dest.countryHref}
                            href={dest.countryHref}
                            onClick={close}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                          >
                            <span aria-hidden="true">{dest.flag}</span>
                            {dest.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {group.id === 'clinics' && featured.length > 0 && (
                    <div className="mt-2 px-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                        {t.nav.countries}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {featured.map((dest) => (
                          <Link
                            key={dest.href}
                            href={dest.href}
                            onClick={close}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
                          >
                            <span aria-hidden="true">{dest.flag}</span>
                            {dest.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {group.id === 'clinics' &&
                    activeTreatments.map((treatment) => {
                      const treatmentCountries = featured.filter((c) =>
                        treatment.countries.includes(countryKeyFromFeatured(c)),
                      )
                      if (treatmentCountries.length === 0) return null
                      return (
                        <div key={treatment.id} className="mt-2 px-3">
                          <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
                            {treatment.name}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {treatmentCountries.map((dest) => {
                              const countryKey = countryKeyFromFeatured(dest)
                              const href = clinicCountryTreatmentPath(
                                countryKey,
                                treatment.id,
                                locale,
                              )
                              return (
                                <Link
                                  key={href}
                                  href={href}
                                  onClick={close}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent-800)] transition-colors hover:bg-[var(--color-accent-100)]"
                                >
                                  <span aria-hidden="true">{dest.flag}</span>
                                  {dest.name}
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )
            })}

            {DIRECT_NAV_HUB_IDS.map((hubId) => {
              const hub = SITE_HUBS.find((h) => h.id === hubId)
              if (!hub) return null
              return (
                <HubItem
                  key={hub.id}
                  hub={hub}
                  label={t.nav[hub.labelKey]}
                  locale={locale}
                  description={t.nav.descriptions[hub.labelKey]}
                  onNavigate={close}
                  badge={hub.status === 'coming_soon' ? t.nav.soon : undefined}
                />
              )
            })}

            <div>
              <SectionTitle>{t.nav.groups.info}</SectionTitle>
              <Link
                href={localizedPath('/about', locale)}
                onClick={close}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
              >
                {t.nav.about}
              </Link>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
