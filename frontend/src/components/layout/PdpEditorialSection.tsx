import type { TocItem } from '@/lib/api/types'
import { ContentHtml } from '@/components/shared/ContentHtml'
import { TableOfContents } from '@/components/layout/TableOfContents'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils/cn'

type PdpEditorialSectionProps = {
  id?: string
  eyebrow?: string
  title: string
  html: string
  tableOfContents?: TocItem[]
  className?: string
}

export function PdpEditorialSection({
  id = 'about',
  eyebrow,
  title,
  html,
  tableOfContents,
  className,
}: PdpEditorialSectionProps) {
  const hasToc = (tableOfContents?.length ?? 0) > 0

  return (
    <section id={id} className={cn('scroll-mt-28', className)}>
      <SectionHeading eyebrow={eyebrow} title={title} className="mb-4" />
      <div
        className={cn(
          hasToc && 'grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10',
        )}
      >
        {hasToc && tableOfContents && (
          <TableOfContents
            items={tableOfContents}
            variant="card"
            className="lg:top-28 lg:self-start"
          />
        )}
        <ContentHtml html={html} variant="guide" />
      </div>
    </section>
  )
}
