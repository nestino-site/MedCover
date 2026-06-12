import Link from 'next/link'
import { Clock, FlaskConical, Globe, Languages, Mail, MapPin, Phone, Users, ExternalLink } from 'lucide-react'
import type { ClinicDetail } from '@/lib/api/types'
import { cn } from '@/lib/utils/cn'

type ClinicFactsSidebarProps = {
  clinic: ClinicDetail
  className?: string
}

type OpeningHours = {
  weekdayDescriptions?: string[]
}

function OpeningHoursBlock({ hours }: { hours: unknown }) {
  const data = hours as OpeningHours
  const descriptions = data?.weekdayDescriptions
  if (!descriptions?.length) return null

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[var(--color-primary-900)] [&::-webkit-details-marker]:hidden">
        <Clock className="h-4 w-4" />
        Opening hours
        <span className="ml-auto text-xs text-[var(--color-neutral-500)] group-open:hidden">Show</span>
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
  const facts = [
    clinic.foundedYear ? { icon: Clock, label: 'Founded', value: String(clinic.foundedYear) } : null,
    clinic.doctorsCount != null
      ? { icon: Users, label: 'Doctors', value: String(clinic.doctorsCount) }
      : null,
    clinic.inHouseLab
      ? { icon: FlaskConical, label: 'In-house lab', value: 'Yes' }
      : null,
    clinic.languages?.length
      ? { icon: Languages, label: 'Languages', value: clinic.languages.join(', ') }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f != null)

  return (
    <aside
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:self-start',
        className,
      )}
    >
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary-950)]">Contact & facts</h2>

      <div className="space-y-3">
        {clinic.phone && (
          <a
            href={`tel:${clinic.phone}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-neutral-50)]"
          >
            <Phone className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            {clinic.phone}
          </a>
        )}
        {clinic.email && (
          <a
            href={`mailto:${clinic.email}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-neutral-50)]"
          >
            <Mail className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            {clinic.email}
          </a>
        )}
        {clinic.websiteUrl && (
          <a
            href={clinic.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-neutral-50)]"
          >
            <Globe className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            Website
            <ExternalLink className="ml-auto h-3 w-3 text-[var(--color-neutral-400)]" />
          </a>
        )}
        {clinic.googleMapsUrl && (
          <a
            href={clinic.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm font-medium hover:bg-[var(--color-neutral-50)]"
          >
            <MapPin className="h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
            View on map
            <ExternalLink className="ml-auto h-3 w-3 text-[var(--color-neutral-400)]" />
          </a>
        )}
      </div>

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
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-[var(--color-primary-900)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
      >
        Get a free quote
      </Link>
    </aside>
  )
}
