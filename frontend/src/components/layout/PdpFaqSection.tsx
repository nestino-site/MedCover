import type { FaqItem } from '@/lib/api/types'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils/cn'

type PdpFaqSectionProps = {
  id?: string
  eyebrow?: string
  title: string
  faqs: FaqItem[]
  className?: string
}

export function PdpFaqSection({
  id = 'faq',
  eyebrow,
  title,
  faqs,
  className,
}: PdpFaqSectionProps) {
  if (faqs.length === 0) return null

  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-subtle)] to-white shadow-[var(--shadow-sm)]',
        className,
      )}
      data-speakable="true"
    >
      <div className="border-b border-[var(--color-border)] bg-white/60 px-6 py-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} className="mb-0" />
      </div>
      <div className="px-6 sm:px-8">
        <FaqAccordion faqs={faqs} variant="compact" title="" defaultOpen={false} />
      </div>
    </section>
  )
}
