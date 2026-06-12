import { cn } from '@/lib/utils/cn'

interface ContentHtmlProps {
  html: string
  className?: string
  variant?: 'default' | 'guide'
}

const defaultProse = [
  'prose prose-neutral max-w-none',
  'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--color-primary-950)]',
  'prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4',
  'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
  'prose-p:text-[var(--color-neutral-700)] prose-p:leading-relaxed',
  'prose-a:text-[var(--color-primary-700)] prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
  'prose-strong:text-[var(--color-neutral-900)] prose-strong:font-semibold',
  'prose-table:text-sm prose-table:my-6',
  'prose-th:bg-[var(--color-neutral-50)] prose-th:font-semibold prose-th:text-[var(--color-primary-900)]',
  'prose-td:align-top prose-tr:border-[var(--color-border)]',
  '[&_tbody_tr:nth-child(even)]:bg-[var(--color-neutral-50)]/60',
  'prose-blockquote:border-[var(--color-accent-300)] prose-blockquote:text-[var(--color-neutral-600)]',
  'prose-li:text-[var(--color-neutral-700)]',
  'prose-img:rounded-xl prose-img:shadow-sm',
]

const guideProse = [
  'prose prose-lg prose-neutral max-w-none',
  'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--color-primary-950)]',
  'prose-h2:scroll-mt-28 prose-h2:mt-14 prose-h2:mb-5 prose-h2:border-b prose-h2:border-[var(--color-primary-100)] prose-h2:pb-3 prose-h2:text-[1.65rem] sm:prose-h2:text-[1.85rem]',
  'prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl prose-h3:text-[var(--color-primary-900)]',
  'prose-h4:mt-8 prose-h4:mb-2 prose-h4:text-lg prose-h4:text-[var(--color-primary-800)]',
  'prose-p:text-[var(--color-neutral-700)] prose-p:leading-[1.8]',
  '[&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:text-[var(--color-neutral-600)]',
  'prose-a:text-[var(--color-primary-700)] prose-a:font-medium prose-a:underline-offset-2 prose-a:decoration-[var(--color-primary-200)] hover:prose-a:decoration-[var(--color-primary-500)]',
  'prose-strong:text-[var(--color-neutral-900)] prose-strong:font-semibold',
  'prose-table:text-sm prose-table:my-8 prose-table:rounded-xl prose-table:overflow-hidden prose-table:shadow-[var(--shadow-xs)]',
  'prose-th:bg-[var(--color-primary-950)] prose-th:font-semibold prose-th:text-white prose-th:px-4 prose-th:py-3',
  'prose-td:align-top prose-td:px-4 prose-td:py-3 prose-tr:border-[var(--color-border)]',
  '[&_tbody_tr:nth-child(even)]:bg-[var(--color-primary-50)]/50',
  'prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-accent-400)] prose-blockquote:bg-[var(--color-accent-50)]/70 prose-blockquote:py-4 prose-blockquote:pl-5 prose-blockquote:not-italic prose-blockquote:text-[var(--color-neutral-700)] prose-blockquote:shadow-xs',
  'prose-li:text-[var(--color-neutral-700)] prose-li:leading-relaxed',
  'prose-ul:marker:text-[var(--color-accent-500)]',
  'prose-ol:marker:font-semibold prose-ol:marker:text-[var(--color-primary-600)]',
  'prose-img:rounded-2xl prose-img:shadow-[var(--shadow-md)] prose-img:ring-1 prose-img:ring-[var(--color-border)]',
  'prose-hr:my-14 prose-hr:border-[var(--color-border)]',
  'prose-code:rounded prose-code:bg-[var(--color-neutral-100)] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[var(--color-primary-800)] prose-code:before:content-none prose-code:after:content-none',
]

export function ContentHtml({ html, className, variant = 'default' }: ContentHtmlProps) {
  if (!html) return null

  return (
    <div
      className={cn(variant === 'guide' ? guideProse : defaultProse, className)}
      // Backend delivers sanitized HTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
