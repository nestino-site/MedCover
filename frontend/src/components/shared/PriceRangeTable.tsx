import Link from 'next/link'

type PriceRow = {
  label: string
  min: number
  max: number
  currency: string
  href?: string
  meta?: string
}

type PriceRangeTableProps = {
  title?: string
  rows: PriceRow[]
}

function formatRange(min: number, max: number, currency: string): string {
  const sym = currency === 'EUR' ? '€' : currency
  return `${sym}${min.toLocaleString()}–${sym}${max.toLocaleString()}`
}

export function PriceRangeTable({ title, rows }: PriceRangeTableProps) {
  if (rows.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      {title && (
        <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-semibold text-[var(--color-primary-950)]">{title}</h2>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-neutral-50)]">
              <th className="px-3 py-3 font-semibold text-[var(--color-neutral-700)] sm:px-6">Location</th>
              <th className="px-3 py-3 font-semibold text-[var(--color-neutral-700)] sm:px-6">Price range</th>
              <th className="px-3 py-3 font-semibold text-[var(--color-neutral-700)] sm:px-6">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-3 font-medium text-[var(--color-primary-900)] sm:px-6 sm:py-4">
                  {row.href ? (
                    <Link href={row.href} className="hover:underline">
                      {row.label}
                    </Link>
                  ) : (
                    row.label
                  )}
                </td>
                <td className="px-3 py-3 text-[var(--color-neutral-800)] sm:px-6 sm:py-4">
                  {formatRange(row.min, row.max, row.currency)}
                </td>
                <td className="px-3 py-3 text-[var(--color-neutral-500)] sm:px-6 sm:py-4">{row.meta ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
