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
              <th className="px-6 py-4 font-semibold text-[var(--color-neutral-700)]">Factor</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-primary-900)]">{titleA}</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-primary-900)]">{titleB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-6 py-4 font-medium text-[var(--color-neutral-700)]">{row.label}</td>
                <td
                  className={cn(
                    'px-6 py-4',
                    row.winner === 'a' &&
                      'bg-[var(--color-accent-50)] font-semibold text-[var(--color-accent-900)]',
                  )}
                >
                  {row.valueA}
                  {row.winner === 'a' && (
                    <span className="ml-2 rounded bg-[var(--color-accent-200)] px-1.5 py-0.5 text-xs">Winner</span>
                  )}
                </td>
                <td
                  className={cn(
                    'px-6 py-4',
                    row.winner === 'b' &&
                      'bg-[var(--color-accent-50)] font-semibold text-[var(--color-accent-900)]',
                  )}
                >
                  {row.valueB}
                  {row.winner === 'b' && (
                    <span className="ml-2 rounded bg-[var(--color-accent-200)] px-1.5 py-0.5 text-xs">Winner</span>
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
