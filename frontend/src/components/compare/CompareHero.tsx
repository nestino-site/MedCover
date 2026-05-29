import { getDictionary, type Locale } from '@/lib/i18n'

export function CompareHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <section
      className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
      aria-labelledby="compare-hero-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-600)]">
          {t.hubs.compareHub.eyebrow}
        </p>
        <h1
          id="compare-hero-heading"
          className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-primary-950)] sm:text-4xl"
        >
          {t.hubs.compareHub.title}
        </h1>
        <p
          className="mt-3 max-w-2xl text-base text-[var(--color-neutral-600)]"
          data-speakable="true"
        >
          {t.hubs.compareHub.description}
        </p>
      </div>
    </section>
  )
}
