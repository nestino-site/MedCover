import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import type { ContentPage } from '@/lib/api/types'
import { en } from '@/lib/i18n/en'

interface CountryFeaturedGuideProps {
  guide: ContentPage | null
  countryKey: string
  countryName: string
}


export function CountryFeaturedGuide({ guide, countryKey, countryName }: CountryFeaturedGuideProps) {
  const t = en.countryLanding.featuredGuide
  const guideHref = `/guides/${countryKey}-ivf-guide`

  return (
    <section aria-labelledby="featured-guide-heading">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)]">
        <div className="border-b border-[var(--color-primary-100)] px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[var(--color-primary-600)]" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary-600)]">
              {t.eyebrow}
            </p>
          </div>
          <h2 id="featured-guide-heading" className="mt-1 text-xl font-bold text-[var(--color-primary-950)]">
            {countryName} IVF Guide
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {guide ? (
            <>
              {/* Guide meta description as answer */}
              {guide.seo.metaDescription && (
                <p className="text-base leading-relaxed text-[var(--color-neutral-700)]">
                  {guide.seo.metaDescription}
                </p>
              )}

              {/* FAQ preview — up to 2 questions (AEO anchor) */}
              {guide.faq.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-neutral-500)]">
                    {t.faqPreviewHeading}
                  </p>
                  <div className="space-y-4">
                    {guide.faq.slice(0, 2).map((item, i) => (
                      <div key={i} className="rounded-xl border border-[var(--color-primary-100)] bg-white p-4">
                        <p className="text-sm font-semibold text-[var(--color-primary-900)]">
                          {item.question}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-neutral-600)] line-clamp-3">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA to full guide */}
              <div className="mt-6">
                <Link
                  href={guideHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-700)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-800)]"
                >
                  {t.readFull}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            /* Coming soon state */
            <div className="flex flex-col items-start gap-4">
              <p className="text-base text-[var(--color-neutral-600)]">{t.comingSoonBody}</p>
              <span className="rounded-full border border-[var(--color-primary-200)] px-3 py-1 text-xs font-medium text-[var(--color-primary-600)]">
                {t.comingSoon}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
