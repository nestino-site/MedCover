export interface HubHeroStat {
  value: string
  label: string
}

interface HubHeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  stats?: HubHeroStat[]
}

export function HubHero({ eyebrow, title, subtitle, stats }: HubHeroProps) {
  return (
    <section className="border-b border-[var(--color-primary-100)] bg-[var(--color-primary-50)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[var(--color-neutral-600)]">{subtitle}</p>
        {stats && stats.length > 0 && (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <dd className="text-3xl font-bold text-[var(--color-primary-800)]">{s.value}</dd>
                <dt className="text-sm text-[var(--color-neutral-500)]">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
