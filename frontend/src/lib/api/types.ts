import { z } from 'zod'

// ─── v2.1 Content API contract ──────────────────────────────────────────────

const HeroImageSchema = z.object({
  url: z.string().nullable().default(null),
  alt: z.string().nullable().default(null),
  width: z.number().nullable().default(null),
  height: z.number().nullable().default(null),
})

const OgSchema = z.object({
  title: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
  type: z.string().default('article'),
  url: z.string().default(''),
})

const TwitterSchema = z.object({
  card: z.enum(['summary_large_image', 'summary']).default('summary_large_image'),
  title: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
})

const SeoSchema = z.object({
  title: z.string().nullable().default(null),
  metaTitle: z.string().nullable().default(null),
  metaDescription: z.string().nullable().default(null),
  canonical: z.string().default(''),
  robotsMeta: z.string().default('index, follow'),
  language: z.string().default('en'),
  og: OgSchema.optional().transform((v) => v ?? {
    title: null, description: null, image: null, type: 'article', url: '',
  }),
  twitter: TwitterSchema.optional().transform((v) => v ?? {
    card: 'summary_large_image' as const, title: null, description: null, image: null,
  }),
  hreflangAlternates: z.array(z.unknown()).default([]),
})

const TocItemSchema = z.object({
  level: z.number(),
  text: z.string(),
  anchor: z.string(),
})

const BreadcrumbItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  position: z.number(),
})

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

export const ContentPageSchema = z.object({
  version: z.string().default('2.1'),
  status: z.string().default('ready'),
  finalContent: z.string().nullable().default(null),
  htmlContent: z.string().nullable().default(null),
  language: z.string().default('en'),
  publishedAt: z.string().nullable().default(null),
  updatedAt: z.string(),
  seo: SeoSchema.optional().transform((v) => v ?? {
    title: null, metaTitle: null, metaDescription: null,
    canonical: '', robotsMeta: 'index, follow', language: 'en',
    og: { title: null, description: null, image: null, type: 'article', url: '' },
    twitter: { card: 'summary_large_image' as const, title: null, description: null, image: null },
    hreflangAlternates: [],
  }),
  tableOfContents: z.array(TocItemSchema).default([]),
  breadcrumbs: z.array(BreadcrumbItemSchema).default([]),
  faq: z.array(FaqItemSchema).default([]),
  heroImage: HeroImageSchema.optional().transform((v) => v ?? {
    url: null, alt: null, width: null, height: null,
  }),
  schemaMarkup: z.unknown().default(null),
  imagePrompt: z.string().nullable().default(null),
  analysis: z.unknown().default(null),
  meta: z.unknown().default(null),
})

export const ContentListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  language: z.string(),
  updatedAt: z.string(),
})

export const ContentListResponseSchema = z.object({
  items: z.array(ContentListItemSchema),
})

export type ContentPage = z.infer<typeof ContentPageSchema>
export type ContentListItem = z.infer<typeof ContentListItemSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
export type TocItem = z.infer<typeof TocItemSchema>
export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>
export type HeroImage = z.infer<typeof HeroImageSchema>
