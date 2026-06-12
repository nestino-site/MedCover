type StatItem = {
  label: string
  value: string
  source?: string
}

type StatStripProps = {
  stats: StatItem[]
}

export function StatStrip({ stats }: StatStripProps) {
  if (stats.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--color-neutral-500)]">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-primary-950)]">{stat.value}</p>
          {stat.source && (
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">{stat.source}</p>
          )}
        </div>
      ))}
    </div>
  )
}
