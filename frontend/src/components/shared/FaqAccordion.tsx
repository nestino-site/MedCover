'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '@/lib/api/types'
import { cn } from '@/lib/utils/cn'
import { en } from '@/lib/i18n/en'

interface FaqAccordionProps {
  faqs: FaqItem[]
  title?: string
}

export function FaqAccordion({ faqs, title = en.page.faqTitle }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (faqs.length === 0) return null

  return (
    <section className="py-10" aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="mb-6 text-3xl font-bold tracking-tight text-[var(--color-primary-950)]"
      >
        {title}
      </h2>

      <div className="divide-y divide-[var(--color-border)]">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          const itemId = `faq-item-${index}`

          return (
            <div key={itemId}>
              <h3>
                <button
                  type="button"
                  id={`faq-btn-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold leading-snug text-[var(--color-primary-950)]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'mt-0.5 shrink-0 text-[var(--color-neutral-400)] transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-btn-${index}`}
                hidden={!isOpen}
              >
                <p className="pb-5 text-sm leading-relaxed text-[var(--color-neutral-600)]">
                  {faq.answer}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
