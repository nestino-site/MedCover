import Link from 'next/link'
import {
  Clock,
  FlaskConical,
  Globe,
  Languages,
  Mail,
  MapPin,
  Phone,
  Users,
  ExternalLink,
} from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { TruthScoreBadge } from '@/components/shared/TruthScoreBadge'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

type ClinicFactsSidebarProps = {
  clinic: ClinicDetail
  className?: string
}

type OpeningHours = {
  weekdayDescriptions?: string[]
}

function OpeningHoursBlock({ hours }: { hours: unknown }) {
  const copy = en.clinicPdp.sidebar
  const data = hours as OpeningHours
  const descriptions = data?.weekdayDescriptions
  if (!descriptions?.length) return null

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[var(--color-primary-900)] [&::-webkit-details-marker]:hidden">
        <Clock className="h-4 w-4" />
        {copy.openingHours}
        <span className="ml-auto text-xs text-[var(--color-neutral-500)] group-open:hidden">
          {copy.showHours}
        </span>
      </summary>
      <ul className="mt-3 space-y-1 text-sm text-[var(--color-neutral-600)]">
        {descriptions.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </details>
  )
}

export function ClinicFactsSidebar({ clinic, className }: ClinicFactsSidebarProps) {
  const copy = en.clinicPdp.sidebar

  const facts = [
    clinic.foundedYear
      ? { icon: Clock, label: copy.founded, value: String(clinic.foundedYear) }
      : null,
    clinic.doctorsCount != null
      ? { icon: Users, label: copy.doctors, value: String(clinic.doctorsCount) }
      : null,
    clinic.inHouseLab
      ? { icon: FlaskConical, label: copy.inHouseLab, value: 'Yes' }
      : null,
    clinic.languages?.length
      ? { icon: Languages, label: copy.languages, value: clinic.languages.join(', ') }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f != null)

  const contactLinks = [
    clinic.phone ? { href: `tel:${clinic.phone}`, icon: Phone, label: clinic.phone } : null,
    clinic.email ? { href: `mailto:${clinic.email}`, icon: Mail, label: clinic.email } : null,
    clinic.websiteUrl
      ? { href: clinic.websiteUrl, icon: Globe, label: copy.website, external: true }
      : null,
    clinic.googleMapsUrl
      ? { href: clinic.googleMapsUrl, icon: MapPin, label: copy.viewOnMap, external: true }
      : null,
  ].filter((l): l is NonNullable<typeof l> => l != null)

  return (
    <aside
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:self-start',
        className,
      )}
    >
      {clinic.truthScore?.composite != null && (
        <div className="mb-4 flex justify-center lg:justify-start">
          <TruthScoreBadge
            composite={clinic.truthScore.composite}
            grade={clinic.truthScore.grade}
            size="lg"
          />
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary-950)]">{copy.title}</h2>

      {contactLinks.length > 0 && (
        <div className="space-y-2">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-neutral-50)]"
            >
              <link.icon className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
              <span className="min-w-0 truncate">{link.label}</span>
              {link.external && (
                <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-[var(--color-neutral-400)]" />
              )}
            </a>
          ))}
        </div>
      )}

      {clinic.openingHours != null ? (
        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <OpeningHoursBlock hours={clinic.openingHours} />
        </div>
      ) : null}

      {facts.length > 0 && (
        <dl className="mt-6 space-y-3 border-t border-[var(--color-border)] pt-6">
          {facts.map((fact) => (
            <div key={fact.label} className="flex gap-3 text-sm">
              <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-neutral-400)]" />
              <div>
                <dt className="text-[var(--color-neutral-500)]">{fact.label}</dt>
                <dd className="font-medium text-[var(--color-primary-900)]">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {clinic.addressLine && (
        <p className="mt-6 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-neutral-600)]">
          {clinic.addressLine}
        </p>
      )}

      <Link
        href="/start/"
        className="mt-6 hidden w-full items-center justify-center rounded-xl bg-[var(--color-primary-900)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)] lg:flex"
      >
        {copy.getQuote}
      </Link>
    </aside>
  )
}
