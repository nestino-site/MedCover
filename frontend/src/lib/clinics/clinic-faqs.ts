import type { ClinicDetail, ContentPage, FaqItem } from '@/lib/api/types'

function parseFaqEntity(entity: unknown): FaqItem | null {
  if (!entity || typeof entity !== 'object') return null
  const record = entity as Record<string, unknown>
  if (record['@type'] !== 'Question') return null

  const question = typeof record.name === 'string' ? record.name.trim() : ''
  const accepted = record.acceptedAnswer
  const answer =
    accepted && typeof accepted === 'object'
      ? String((accepted as Record<string, unknown>).text ?? '').trim()
      : ''

  if (!question || !answer) return null
  return { question, answer }
}

/** Pull FAQPage Q&A from CMS JSON-LD when page.faq is empty. */
export function faqsFromCmsSchema(schemaMarkup: unknown): FaqItem[] {
  const items: FaqItem[] = []
  const seen = new Set<string>()

  const visit = (node: unknown): void => {
    if (node == null) return

    if (Array.isArray(node)) {
      for (const child of node) visit(child)
      return
    }

    if (typeof node !== 'object') return

    const record = node as Record<string, unknown>
    if (record['@type'] === 'FAQPage' && Array.isArray(record.mainEntity)) {
      for (const entity of record.mainEntity) {
        const faq = parseFaqEntity(entity)
        if (!faq || seen.has(faq.question)) continue
        seen.add(faq.question)
        items.push(faq)
      }
    }

    for (const value of Object.values(record)) {
      if (value && (Array.isArray(value) || typeof value === 'object')) {
        visit(value)
      }
    }
  }

  visit(schemaMarkup)
  return items
}

export function resolveClinicFaqs(
  clinic: ClinicDetail,
  cmsPage?: ContentPage | null,
): FaqItem[] | undefined {
  if (cmsPage?.faq?.length) return cmsPage.faq
  if (clinic.faqs?.length) return clinic.faqs
  if (cmsPage?.schemaMarkup) {
    const fromSchema = faqsFromCmsSchema(cmsPage.schemaMarkup)
    if (fromSchema.length > 0) return fromSchema
  }
  return undefined
}
