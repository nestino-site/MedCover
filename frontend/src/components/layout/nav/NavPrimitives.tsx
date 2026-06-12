'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { SiteHub } from '@/lib/content/site-nav'
import { hubPath } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'
import { TreatmentIconBadge } from '@/components/shared/TreatmentIconBadge'
import { getTreatmentIconStyle } from '@/lib/content/treatment-icons'

export const NAV_PREVIEW_LIMIT = 5

export function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
      {children}
    </p>
  )
}

export function NavHubCard({
  hub,
  label,
  description,
  locale,
  onNavigate,
  badge,
  compact,
  variant = 'card',
  layout = 'card',
}: {
  hub: SiteHub
  label: string
  description?: string
  locale: Locale
  onNavigate: () => void
  badge?: string
  compact?: boolean
  variant?: 'card' | 'nav'
  layout?: 'card' | 'inline'
}) {
  const Icon: LucideIcon = hub.icon

  if (layout === 'inline') {
    return (
      <Link
        href={hubPath(hub.id, locale)}
        onClick={onNavigate}
        className="group inline-flex min-h-10 items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-50)]/70 to-white px-2.5 py-2 transition-all hover:border-[var(--color-primary-200)] hover:shadow-sm"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-primary-700)] shadow-sm ring-1 ring-[var(--color-border)]">
          <Icon size={15} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-[var(--color-neutral-900)] group-hover:text-[var(--color-primary-800)]">
          {label}
        </span>
        {badge && (
          <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
            {badge}
          </span>
        )}
        <ArrowRight
          size={12}
          className="ml-auto shrink-0 text-[var(--color-accent-600)] transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    )
  }

  if (variant === 'nav') {
    return (
      <Link
        href={hubPath(hub.id, locale)}
        onClick={onNavigate}
        className="group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary-50)]/70 to-white p-3 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-primary-700)] shadow-sm ring-1 ring-[var(--color-border)]">
          <Icon size={16} aria-hidden="true" />
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
          </span>
          {description && (
            <span className="text-xs leading-relaxed text-[var(--color-neutral-500)]">{description}</span>
          )}
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent-600)]">
            Explore
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={hubPath(hub.id, locale)}
      onClick={onNavigate}
      className={`group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-neutral-50)]/60 transition-all hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:shadow-sm ${
        compact ? 'p-2.5' : 'p-3'
      }`}
    >
      <span
        className={`flex flex-shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-primary-700)] shadow-sm ring-1 ring-[var(--color-border)] ${
          compact ? 'h-8 w-8' : 'h-9 w-9'
        }`}
      >
        <Icon size={compact ? 15 : 17} aria-hidden="true" />
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
        {description && (
          <span className="text-xs leading-relaxed text-[var(--color-neutral-500)]">{description}</span>
        )}
      </span>
    </Link>
  )
}

export function NavBrowseLink({
  href,
  label,
  onNavigate,
}: {
  href: string
  label: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-primary-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-900)]"
    >
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  )
}

export function NavFlatLink({
  href,
  label,
  onNavigate,
  icon: Icon,
}: {
  href: string
  label: string
  onNavigate: () => void
  icon?: LucideIcon
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
    >
      {Icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          <Icon size={15} aria-hidden="true" />
        </span>
      )}
      {label}
    </Link>
  )
}

export function NavSimpleRow({
  href,
  onNavigate,
  children,
}: {
  href: string
  onNavigate: () => void
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="group flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium text-[var(--color-neutral-800)] transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        {children}
      </Link>
    </li>
  )
}

export function NavMicroLink({
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
      className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--color-primary-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-900)]"
    >
      {children}
    </Link>
  )
}

export function NavViewAllLink({
  href,
  label,
  onNavigate,
}: {
  href: string
  label: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary-700)] transition-colors hover:text-[var(--color-primary-900)]"
    >
      {label}
      <ArrowRight size={12} aria-hidden="true" />
    </Link>
  )
}

export function NavPanelTabs({
  tabs,
  defaultTab,
  children,
}: {
  tabs: { id: string; label: string; count?: number }[]
  defaultTab?: string
  children: (activeTab: string) => React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '')

  return (
    <div>
      <div
        className="-mx-1 mb-2 flex gap-0.5 overflow-x-auto border-b border-[var(--color-border)]"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex min-h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors',
                isActive
                  ? 'border-[var(--color-primary-700)] text-[var(--color-primary-800)]'
                  : 'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                      : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="min-h-[10.5rem]" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  )
}

function NavActionChip({
  href,
  onClick,
  children,
  primary,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors',
        primary
          ? 'bg-[var(--color-primary-800)] text-white hover:bg-[var(--color-primary-700)]'
          : 'border border-[var(--color-border)] bg-white text-[var(--color-neutral-700)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]',
      )}
    >
      {children}
    </Link>
  )
}

export type NavCountryActionLabels = {
  overview: string
  clinics: string
  guide: string
}

export type NavCountryRow = {
  name: string
  flag: string
  countryHref: string
  clinicHref: string
  guideHref: string | null
}

export type NavCityRow = {
  cityName: string
  countryName: string
  flag: string
  overviewHref: string
  clinicHref: string
  guideHref: string | null
}

export function NavCountryActions({
  countries,
  labels,
  onNavigate,
  limit = NAV_PREVIEW_LIMIT,
}: {
  countries: NavCountryRow[]
  labels: NavCountryActionLabels
  onNavigate: () => void
  limit?: number
}) {
  const rows = countries.slice(0, limit)

  return (
    <ul className="flex flex-col gap-0.5">
      {rows.map((country) => (
        <li
          key={country.countryHref}
          className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 transition-colors hover:border-[var(--color-border)] hover:bg-white"
        >
          <Link
            href={country.countryHref}
            onClick={onNavigate}
            className="group/name flex min-w-0 flex-1 items-center gap-2"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-base leading-none"
              aria-hidden="true"
            >
              {country.flag}
            </span>
            <span className="truncate text-sm font-medium text-[var(--color-primary-950)] group-hover/name:text-[var(--color-primary-700)]">
              {country.name}
            </span>
          </Link>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <NavActionChip href={country.countryHref} onClick={onNavigate} primary>
              {labels.overview}
            </NavActionChip>
            <NavActionChip href={country.clinicHref} onClick={onNavigate}>
              {labels.clinics}
            </NavActionChip>
            {country.guideHref && (
              <NavActionChip href={country.guideHref} onClick={onNavigate}>
                {labels.guide}
              </NavActionChip>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function NavCityActions({
  cities,
  labels,
  onNavigate,
  limit = NAV_PREVIEW_LIMIT,
}: {
  cities: NavCityRow[]
  labels: NavCountryActionLabels
  onNavigate: () => void
  limit?: number
}) {
  const rows = cities.slice(0, limit)

  return (
    <ul className="flex flex-col gap-0.5">
      {rows.map((city) => (
        <li
          key={`${city.overviewHref}-${city.cityName}`}
          className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 transition-colors hover:border-[var(--color-border)] hover:bg-white"
        >
          <Link
            href={city.overviewHref}
            onClick={onNavigate}
            className="group/name min-w-0 flex-1"
          >
            <span className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-base leading-none"
                aria-hidden="true"
              >
                {city.flag}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--color-primary-950)] group-hover/name:text-[var(--color-primary-700)]">
                  {city.cityName}
                </span>
                <span className="block truncate text-[10px] text-[var(--color-neutral-500)]">
                  {city.countryName}
                </span>
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            <NavActionChip href={city.overviewHref} onClick={onNavigate} primary>
              {labels.overview}
            </NavActionChip>
            <NavActionChip href={city.clinicHref} onClick={onNavigate}>
              {labels.clinics}
            </NavActionChip>
            {city.guideHref && (
              <NavActionChip href={city.guideHref} onClick={onNavigate}>
                {labels.guide}
              </NavActionChip>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function NavCountryList({
  countries,
  onNavigate,
  limit = NAV_PREVIEW_LIMIT,
}: {
  countries: Array<{ name: string; flag: string; href: string; clinicCount?: string }>
  onNavigate: () => void
  limit?: number
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {countries.slice(0, limit).map((country) => (
        <li key={country.href}>
          <Link
            href={country.href}
            onClick={onNavigate}
            className="group flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1.5 transition-all hover:border-[var(--color-border)] hover:bg-white"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-base leading-none"
              aria-hidden="true"
            >
              {country.flag}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {country.name}
              </span>
              {country.clinicCount && (
                <span className="block text-[10px] text-[var(--color-neutral-500)]">
                  {country.clinicCount}
                </span>
              )}
            </span>
            <ArrowRight
              size={12}
              className="shrink-0 text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function NavCityList({
  cities,
  onNavigate,
  limit = NAV_PREVIEW_LIMIT,
}: {
  cities: Array<{ cityName: string; countryName: string; href: string; flag?: string }>
  onNavigate: () => void
  limit?: number
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {cities.slice(0, limit).map((city) => (
        <li key={city.href}>
          <Link
            href={city.href}
            onClick={onNavigate}
            className="group flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1.5 transition-all hover:border-[var(--color-border)] hover:bg-white"
          >
            {city.flag ? (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-base leading-none"
                aria-hidden="true"
              >
                {city.flag}
              </span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-50)] text-[10px] font-bold text-[var(--color-primary-700)]">
                {city.cityName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {city.cityName}
              </span>
              <span className="block truncate text-[10px] text-[var(--color-neutral-500)]">
                {city.countryName}
              </span>
            </span>
            <ArrowRight
              size={12}
              className="shrink-0 text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function NavTreatmentRow({
  treatmentId,
  name,
  treatmentHref,
  onNavigate,
  badge,
}: {
  treatmentId: string
  name: string
  treatmentHref: string
  onNavigate: () => void
  badge?: string
}) {
  return (
    <li>
      <Link
        href={treatmentHref}
        onClick={onNavigate}
        className="group flex items-center justify-between rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-medium text-[var(--color-neutral-800)] transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        <span className="flex items-center gap-2">
          <TreatmentIconBadge treatmentId={treatmentId} size="sm" />
          {name}
          {badge && (
            <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
              {badge}
            </span>
          )}
        </span>
        <ArrowRight
          size={12}
          className="text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}

export type NavTreatmentGridItem = {
  id: string
  name: string
  status: 'active' | 'coming_soon'
  href?: string
  clinicCount?: number
}

export function NavTreatmentGrid({
  treatments,
  onNavigate,
  labels,
}: {
  treatments: NavTreatmentGridItem[]
  onNavigate: () => void
  labels: {
    browseClinics: string
    clinicCount: string
    soon: string
  }
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {treatments.map((treatment) => {
        const iconStyle = getTreatmentIconStyle(treatment.id)
        const clinicMeta =
          treatment.clinicCount && treatment.clinicCount > 0
            ? labels.clinicCount.replace('{count}', String(treatment.clinicCount))
            : null

        if (treatment.status === 'active' && treatment.href) {
          return (
            <li key={treatment.id}>
              <Link
                href={treatment.href}
                onClick={onNavigate}
                className={cn(
                  'group flex h-full flex-col gap-2.5 rounded-xl border border-[var(--color-border)] bg-white p-3 transition-all',
                  'hover:border-[var(--color-primary-200)] hover:shadow-sm',
                  iconStyle.bg,
                )}
              >
                <span className="flex items-start gap-2.5">
                  <TreatmentIconBadge treatmentId={treatment.id} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-800)]">
                      {treatment.name}
                    </span>
                    {clinicMeta && (
                      <span className="mt-0.5 block text-[11px] text-[var(--color-neutral-500)]">
                        {clinicMeta}
                      </span>
                    )}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent-600)] group-hover:text-[var(--color-accent-700)]">
                  {labels.browseClinics}
                  <ArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          )
        }

        return (
          <li key={treatment.id}>
            <div
              className={cn(
                'flex h-full flex-col gap-2.5 rounded-xl border border-dashed border-[var(--color-border)] p-3',
                iconStyle.bg,
                'opacity-80',
              )}
            >
              <span className="flex items-start gap-2.5">
                <TreatmentIconBadge treatmentId={treatment.id} size="md" className="opacity-60" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[var(--color-neutral-600)]">
                    {treatment.name}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
                  {labels.soon}
                </span>
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function NavMegaPanel({
  panelRef,
  panelKey,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>
  panelKey: number
  onMouseEnter: () => void
  onMouseLeave: () => void
  children: React.ReactNode
}) {
  return (
    <div
      ref={panelRef}
      key={panelKey}
      className="mega-panel-enter absolute inset-x-0 top-full z-50 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] shadow-[var(--shadow-lg)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
    >
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
