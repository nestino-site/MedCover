import Link from 'next/link'
import { ArrowRight, Globe, ShieldCheck, Users } from 'lucide-react'

const destinations = [
  { name: 'Spain', href: '/guides/spain-ivf-guide/', flag: '🇪🇸', tagline: 'Top-rated egg donation' },
  { name: 'Greece', href: '/guides/greece-ivf-guide/', flag: '🇬🇷', tagline: 'Mediterranean care' },
  { name: 'Czech Republic', href: '/guides/czech-republic-ivf-guide/', flag: '🇨🇿', tagline: 'Affordable & experienced' },
  { name: 'Turkey', href: '/guides/turkey-ivf-guide/', flag: '🇹🇷', tagline: 'Growing success rates' },
  { name: 'Portugal', href: '/guides/portugal-ivf-guide/', flag: '🇵🇹', tagline: 'Atlantic coast option' },
  { name: 'North Macedonia', href: '/guides/north-macedonia-ivf-guide/', flag: '🇲🇰', tagline: 'Budget-friendly' },
]

const features = [
  {
    icon: <ShieldCheck size={22} className="text-[var(--color-accent-500)]" />,
    title: 'Verified patient interviews',
    description: 'Not clinic marketing. Real voices from real patients who went abroad for IVF.',
  },
  {
    icon: <Globe size={22} className="text-[var(--color-primary-500)]" />,
    title: 'Truth Score ranking',
    description: 'Clinics ranked by what patients actually experienced — cost transparency, English, outcomes.',
  },
  {
    icon: <Users size={22} className="text-[var(--color-trust-600)]" />,
    title: 'Independent & unbiased',
    description: 'MedCover earns nothing from clinic referrals. Our only product is verified truth.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-950)] to-[var(--color-primary-800)] py-24 sm:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, var(--color-accent-400) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
            Verified IVF Clinic Data
          </p>
          <h1 className="text-[var(--text-6xl)] font-bold tracking-tight text-white">
            IVF Abroad —<br className="hidden sm:block" /> Without the Guesswork
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-primary-200)]">
            Real cost data. Verified patient interviews. Truth Scores for every clinic. Everything you
            need to make the right decision about IVF abroad — not what clinics want you to believe.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/guides/"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-trust-500)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-trust-400)] transition-colors"
            >
              Browse Country Guides
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/start/"
              className="inline-flex items-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-medium text-[var(--color-primary-100)] hover:border-white/40 hover:text-white transition-colors"
            >
              Get Matched to a Clinic
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-[var(--text-3xl)] font-bold tracking-tight text-[var(--color-primary-950)]">
            Top IVF Destinations
          </h2>
          <p className="mt-3 text-[var(--color-neutral-600)]">
            Country-level guides built from verified patient interviews
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <Link
              key={dest.href}
              href={dest.href}
              className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-primary-200)] transition-all"
            >
              <span className="text-4xl" role="img" aria-label={dest.name}>
                {dest.flag}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)] transition-colors">
                  IVF in {dest.name}
                </p>
                <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">{dest.tagline}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-[var(--color-neutral-300)] group-hover:text-[var(--color-primary-500)] transition-colors"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[var(--shadow-sm)]">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-primary-950)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-neutral-600)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
