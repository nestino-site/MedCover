interface SpeakableSummaryProps {
  children: React.ReactNode
  label?: string
}

export function SpeakableSummary({ children, label }: SpeakableSummaryProps) {
  return (
    <div
      data-speakable="true"
      className="my-8 rounded-xl border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] px-6 py-5"
    >
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-700)]">
          {label}
        </p>
      )}
      <div className="text-sm leading-relaxed text-[var(--color-accent-900)]">
        {children}
      </div>
    </div>
  )
}
