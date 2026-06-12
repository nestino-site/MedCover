import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export interface HubHeroStat {
  value: string
  label: string
}

export interface HubHeroCta {
  label: string
  href: string
  variant?: 'primary' | 'outline'
}

interface HubHeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  stats?: HubHeroStat[]
  ctas?: HubHeroCta[]
  trust?: string
  highlights?: readonly string[]
  variant?: 'full' | 'compact'
}

export function HubHero({
  eyebrow,
  title,
  subtitle,
  stats,
  ctas,
  trust,
  highlights,
  variant = 'full',
}: HubHeroProps) {
  const isCompact = variant === 'compact'
  const hasCtas = !isCompact && ctas && ctas.length > 0
  const hasStats = stats && stats.length > 0
  const hasHighlights = !isCompact && highlights && highlights.length > 0

  if (isCompact) {
    return (
      <section
        className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
        aria-labelledby="hub-hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
                {eyebrow}
              </p>
            )}
            <h1
              id="hub-hero-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-3xl lg:text-4xl"
            >
              {title}
            </h1>
            <p
              className="mt-3 max-w-2xl text-base text-[var(--color-neutral-600)]"
              data-speakable="true"
            >
              {subtitle}
            </p>
            {hasStats && (
              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <dd className="text-lg font-bold tabular-nums text-[var(--color-primary-900)]">
                      {s.value}
                    </dd>
                    <dt className="text-sm text-[var(--color-neutral-500)]">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--color-primary-100)]"
      aria-labelledby="hub-hero-heading"
    >
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% -10%, var(--color-primary-100) 0%, transparent 70%), linear-gradient(160deg, var(--color-primary-50) 0%, #ffffff 60%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--color-primary-900) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-500)]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-700)]">
                {eyebrow}
              </p>
            </div>
          )}

          <h1
            id="hub-hero-heading"
            className="text-3xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-4xl lg:text-5xl"
          >
            {title}
          </h1>

          <p
            className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-neutral-600)]"
            data-speakable="true"
          >
            {subtitle}
          </p>

          {hasHighlights && (
            <ul className="mt-5 space-y-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-[var(--color-neutral-700)]">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-500)]"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {hasCtas && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {ctas.map((cta) =>
                cta.variant === 'outline' ? (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-300)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-700)] transition-colors hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]"
                  >
                    {cta.label}
                  </Link>
                ) : (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary-800)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)]"
                  >
                    {cta.label}
                  </Link>
                ),
              )}
            </div>
          )}

          {hasStats && (
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-[var(--color-primary-100)] pt-6">
              {stats.map((s, i) => (
                <div key={s.label} className="flex items-center gap-4">
                  {i > 0 && (
                    <div
                      className="hidden h-8 w-px bg-[var(--color-primary-200)] sm:block"
                      aria-hidden="true"
                    />
                  )}
                  <div className="flex flex-col">
                    <dd className="text-xl font-bold tabular-nums text-[var(--color-primary-900)] sm:text-2xl">
                      {s.value}
                    </dd>
                    <dt className="text-xs text-[var(--color-neutral-500)]">{s.label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {trust && (
            <p className="mt-5 flex items-center gap-1.5 text-xs text-[var(--color-neutral-400)]">
              <ShieldCheck size={13} className="text-[var(--color-accent-500)]" aria-hidden="true" />
              {trust}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
