'use client'

import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { SiteHub } from '@/lib/content/site-nav'
import { hubPath } from '@/lib/content/site-nav'
import type { Locale } from '@/lib/i18n'

export function NavSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold text-[var(--color-neutral-500)]">
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
        className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--color-neutral-800)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        <Icon size={16} className="text-[var(--color-primary-700)]" aria-hidden="true" />
        {label}
        {badge && (
          <span className="rounded-md bg-[var(--color-neutral-100)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--color-neutral-400)]">
            {badge}
          </span>
        )}
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
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-700)] transition-colors hover:text-[var(--color-primary-900)]"
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
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
    >
      {Icon && <Icon size={16} className="text-[var(--color-primary-600)]" aria-hidden="true" />}
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
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-800)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        {children}
      </Link>
    </li>
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
    <ul className="space-y-0.5">
      {countries.slice(0, limit).map((country) => (
        <NavSimpleRow key={country.href} href={country.href} onNavigate={onNavigate}>
          <span aria-hidden="true">{country.flag}</span>
          <span className="min-w-0 flex-1 truncate">{country.name}</span>
          {country.clinicCount && (
            <span className="text-xs font-normal text-[var(--color-neutral-400)]">
              {country.clinicCount}
            </span>
          )}
        </NavSimpleRow>
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
    <ul className="space-y-0.5">
      {cities.slice(0, limit).map((city) => (
        <NavSimpleRow key={city.href} href={city.href} onNavigate={onNavigate}>
          {city.flag && <span aria-hidden="true">{city.flag}</span>}
          <span className="min-w-0 flex-1 truncate">
            {city.cityName}
            <span className="font-normal text-[var(--color-neutral-500)]"> · {city.countryName}</span>
          </span>
        </NavSimpleRow>
      ))}
    </ul>
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
      className="text-sm font-medium text-[var(--color-primary-700)] transition-colors hover:text-[var(--color-primary-900)]"
    >
      {children}
    </Link>
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
        className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-neutral-800)] transition-colors hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-800)]"
      >
        {name}
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
      className="mega-panel-enter absolute inset-x-0 top-full z-50 border-b border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
