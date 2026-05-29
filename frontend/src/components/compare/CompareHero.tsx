import { getDictionary, type Locale } from '@/lib/i18n'

const PREVIEW_LOCATIONS = [
  { flag: '🇪🇸', name: 'Spain', cost: 'from €3,200', key: 'spain' },
  { flag: '🇬🇷', name: 'Greece', cost: 'from €2,800', key: 'greece' },
  { flag: '🇨🇿', name: 'Czech Republic', cost: 'from €2,400', key: 'czech-republic' },
]

export function CompareHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)

  return (
    <section className="relative overflow-hidden bg-[var(--color-primary-950)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, currentColor 39px, currentColor 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, currentColor 39px, currentColor 40px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Eyebrow */}
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent-400)]">
          {t.hubs.compareHub.eyebrow}
        </p>

        {/* Headline */}
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {t.hubs.compareHub.title}
        </h1>

        {/* Subline */}
        <p
          className="mt-4 max-w-xl text-lg text-[var(--color-primary-300)]"
          data-speakable="true"
        >
          {t.hubs.compareHub.description}
        </p>

        {/* Location preview cards */}
        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {PREVIEW_LOCATIONS.map((loc, i) => (
            <>
              {i > 0 && (
                <span
                  key={`vs-${i}`}
                  className="shrink-0 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-primary-400)]"
                  aria-hidden="true"
                >
                  {t.hubs.compareHub.vsLabel}
                </span>
              )}
              <div
                key={loc.key}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl border border-[var(--color-primary-700)] bg-[var(--color-primary-900)] px-5 py-4 text-center"
              >
                <span className="text-3xl leading-none" role="img" aria-label={loc.name}>
                  {loc.flag}
                </span>
                <p className="mt-1 font-semibold text-white">{loc.name}</p>
                <p className="text-sm text-[var(--color-primary-400)]">{loc.cost}</p>
              </div>
            </>
          ))}
        </div>

        <p className="mt-5 text-xs text-[var(--color-primary-500)]">
          Verified patient data — no sponsored results
        </p>
      </div>
    </section>
  )
}
