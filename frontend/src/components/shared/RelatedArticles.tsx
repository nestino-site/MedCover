import Link from 'next/link'
import { FileText } from 'lucide-react'
import type { GuideArticleItem } from '@/lib/content/hubs'

interface RelatedArticlesProps {
  id?: string
  eyebrow: string
  heading: string
  articles: GuideArticleItem[]
  emptyMessage?: string
}

export function RelatedArticles({
  id = 'related-articles-heading',
  eyebrow,
  heading,
  articles,
  emptyMessage,
}: RelatedArticlesProps) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {eyebrow}
        </p>
        <h2 id={id} className="mt-1 text-xl font-bold text-[var(--color-primary-950)]">
          {heading}
        </h2>
      </div>

      {articles.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={article.href}
                className="group flex min-h-[72px] items-start gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 transition-colors hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]/40"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                  <FileText size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[var(--color-primary-950)] group-hover:text-[var(--color-primary-700)]">
                    {article.title}
                  </span>
                  {article.description && (
                    <span className="mt-1 block line-clamp-2 text-sm text-[var(--color-neutral-600)]">
                      {article.description}
                    </span>
                  )}
                  <span className="mt-2 block text-sm font-medium text-[var(--color-accent-600)]">
                    Read guide →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        emptyMessage && (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] px-6 py-8 text-center text-[var(--color-neutral-500)]">
            {emptyMessage}
          </p>
        )
      )}
    </section>
  )
}
