import { cn } from '@/lib/utils/cn'

interface ContentHtmlProps {
  html: string
  className?: string
}

export function ContentHtml({ html, className }: ContentHtmlProps) {
  if (!html) return null

  return (
    <div
      className={cn(
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
        className,
      )}
      // Backend delivers sanitized HTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
