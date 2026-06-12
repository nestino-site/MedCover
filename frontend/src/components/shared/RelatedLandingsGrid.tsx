import Link from 'next/link'

export type RelatedLanding = {
  title: string
  href: string
  description?: string
  badge?: string
}

type RelatedLandingsGridProps = {
  title?: string
  items: RelatedLanding[]
}

export function RelatedLandingsGrid({ title = 'Related pages', items }: RelatedLandingsGridProps) {
  if (items.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-[var(--color-primary-950)]">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-[var(--color-primary-900)] group-hover:underline">
                {item.title}
              </h3>
              {item.badge && (
                <span className="shrink-0 rounded-md bg-[var(--color-primary-50)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary-700)]">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="mt-2 text-sm text-[var(--color-neutral-600)]">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
