'use client'

import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { SiteHub } from '@/lib/content/site-nav'
import { hubPath } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils/cn'

export function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-neutral-400)]">
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
}: {
  hub: SiteHub
  label: string
  description?: string
  locale: Locale
  onNavigate: () => void
  badge?: string
  compact?: boolean
  variant?: 'card' | 'nav'
}) {
  const Icon: LucideIcon = hub.icon

  if (variant === 'nav') {
    return (
      <Link
        href={hubPath(hub.id, locale)}
        onClick={onNavigate}
        className="group flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary-50)]/70 to-white p-4 transition-all hover:border-[var(--color-primary-200)] hover:shadow-md"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-primary-700)] shadow-sm ring-1 ring-[var(--color-border)]">
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
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
      className="flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
    >
      {Icon && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
          <Icon size={16} aria-hidden="true" />
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
        className="group flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--color-neutral-800)] transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
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
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-primary-700)] transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-900)]"
    >
      {children}
    </Link>
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
        'inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
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
  limit = 6,
}: {
  countries: NavCountryRow[]
  labels: NavCountryActionLabels
  onNavigate: () => void
  limit?: number
}) {
  const rows = countries.slice(0, limit)

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {rows.map((country) => (
        <li
          key={country.countryHref}
          className="rounded-xl border border-[var(--color-border)] bg-white p-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/20"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-lg leading-none"
              aria-hidden="true"
            >
              {country.flag}
            </span>
            <span className="text-sm font-semibold text-[var(--color-primary-950)]">{country.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
  limit = 8,
}: {
  cities: NavCityRow[]
  labels: NavCountryActionLabels
  onNavigate: () => void
  limit?: number
}) {
  const rows = cities.slice(0, limit)

  return (
    <ul className="grid gap-2">
      {rows.map((city) => (
        <li
          key={`${city.overviewHref}-${city.cityName}`}
          className="rounded-xl border border-[var(--color-border)] bg-white p-3 transition-colors hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/20"
        >
          <div className="mb-2.5 flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-lg leading-none"
              aria-hidden="true"
            >
              {city.flag}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[var(--color-primary-950)]">
                {city.cityName}
              </span>
              <span className="block text-xs text-[var(--color-neutral-500)]">{city.countryName}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
  limit = 6,
}: {
  countries: Array<{ name: string; flag: string; href: string; clinicCount?: string }>
  onNavigate: () => void
  limit?: number
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {countries.slice(0, limit).map((country) => (
        <li key={country.href}>
          <Link
            href={country.href}
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 transition-all hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/30 hover:shadow-sm"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-lg leading-none"
              aria-hidden="true"
            >
              {country.flag}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {country.name}
              </span>
              {country.clinicCount && (
                <span className="mt-0.5 block text-xs text-[var(--color-neutral-500)]">
                  {country.clinicCount}
                </span>
              )}
            </span>
            <ArrowRight
              size={14}
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
  limit = 6,
}: {
  cities: Array<{ cityName: string; countryName: string; href: string; flag?: string }>
  onNavigate: () => void
  limit?: number
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {cities.slice(0, limit).map((city) => (
        <li key={city.href}>
          <Link
            href={city.href}
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 transition-all hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/30 hover:shadow-sm"
          >
            {city.flag ? (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-lg leading-none"
                aria-hidden="true"
              >
                {city.flag}
              </span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-xs font-bold text-[var(--color-primary-700)]">
                {city.cityName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                {city.cityName}
              </span>
              <span className="block truncate text-xs text-[var(--color-neutral-500)]">
                {city.countryName}
              </span>
            </span>
            <ArrowRight
              size={14}
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
  name,
  treatmentHref,
  onNavigate,
}: {
  name: string
  treatmentHref: string
  onNavigate: () => void
}) {
  return (
    <li>
      <Link
        href={treatmentHref}
        onClick={onNavigate}
        className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--color-neutral-800)] transition-all hover:border-[var(--color-border)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        {name}
        <ArrowRight
          size={14}
          className="text-[var(--color-primary-600)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </li>
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
