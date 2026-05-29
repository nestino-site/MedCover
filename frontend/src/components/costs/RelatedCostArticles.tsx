import { getContentListSafe } from '@/lib/api/content'
import { loadRelatedCostArticles } from '@/lib/content/cost-display'
import { en } from '@/lib/i18n/en'
import type { Locale } from '@/lib/i18n'
import { CostGuideCard } from '@/components/costs/CostGuideCard'

interface RelatedCostArticlesProps {
  slugPath: string
  locale: Locale
  maxItems?: number
}

export async function RelatedCostArticles({
  slugPath,
  locale,
  maxItems = 6,
}: RelatedCostArticlesProps) {
  const t = en.costLanding.relatedArticles
  const pages = await getContentListSafe()
  const articles = await loadRelatedCostArticles(slugPath, locale, pages, maxItems)

  if (articles.length === 0) {
    return (
      <section aria-labelledby="related-cost-articles-heading" className="mt-10 border-t border-[var(--color-border)] pt-8">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
            {t.eyebrow}
          </p>
          <h2
            id="related-cost-articles-heading"
            className="mt-1 text-xl font-bold text-[var(--color-primary-950)]"
          >
            {t.heading}
          </h2>
        </div>
        <p className="rounded-xl border border-dashed border-[var(--color-border)] px-6 py-8 text-center text-[var(--color-neutral-500)]">
          {t.empty}
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="related-cost-articles-heading" className="mt-10 border-t border-[var(--color-border)] pt-8">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
          {t.eyebrow}
        </p>
        <h2
          id="related-cost-articles-heading"
          className="mt-1 text-xl font-bold text-[var(--color-primary-950)]"
        >
          {t.heading}
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <CostGuideCard
              href={article.href}
              countryKey={article.countryKey}
              label={article.label}
              title={article.title}
              description={article.description}
              costEstimate={article.costEstimate}
              compact
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
