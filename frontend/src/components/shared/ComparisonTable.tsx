import { cn } from '@/lib/utils/cn'

type ComparisonRow = {
  label: string
  valueA: string
  valueB: string
  winner?: 'a' | 'b' | 'tie'
}

type ComparisonTableProps = {
  titleA: string
  titleB: string
  rows: ComparisonRow[]
}

export function ComparisonTable({ titleA, titleB, rows }: ComparisonTableProps) {
  if (rows.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-neutral-50)]">
              <th className="px-3 py-3 font-semibold text-[var(--color-neutral-700)] sm:px-6 sm:py-4">Factor</th>
              <th className="px-3 py-3 font-semibold text-[var(--color-primary-900)] sm:px-6 sm:py-4">{titleA}</th>
              <th className="px-3 py-3 font-semibold text-[var(--color-primary-900)] sm:px-6 sm:py-4">{titleB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-3 font-medium text-[var(--color-neutral-700)] sm:px-6 sm:py-4">{row.label}</td>
                <td
                  className={cn(
                    'px-3 py-3 sm:px-6 sm:py-4',
                    row.winner === 'a' &&
                      'bg-[var(--color-accent-50)] font-semibold text-[var(--color-accent-900)]',
                  )}
                >
                  {row.valueA}
                  {row.winner === 'a' && (
                    <span className="mt-1 block rounded bg-[var(--color-accent-200)] px-1.5 py-0.5 text-xs sm:ml-2 sm:mt-0 sm:inline-block">Winner</span>
                  )}
                </td>
                <td
                  className={cn(
                    'px-3 py-3 sm:px-6 sm:py-4',
                    row.winner === 'b' &&
                      'bg-[var(--color-accent-50)] font-semibold text-[var(--color-accent-900)]',
                  )}
                >
                  {row.valueB}
                  {row.winner === 'b' && (
                    <span className="mt-1 block rounded bg-[var(--color-accent-200)] px-1.5 py-0.5 text-xs sm:ml-2 sm:mt-0 sm:inline-block">Winner</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
