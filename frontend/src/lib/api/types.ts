import { z } from 'zod'

const BreadcrumbItemSchema = z.object({
  name: z.string(),
  path: z.string(),
})

const TocItemSchema = z.object({
  text: z.string(),
  level: z.number(),
  id: z.string(),
})

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
})

const HreflangItemSchema = z.object({
  language: z.string(),
  url: z.string(),
})

const SeoSchema = z.object({
  canonicalUrl: z.string(),
  openGraph: z.record(z.string(), z.unknown()).default({}),
  twitterCard: z.record(z.string(), z.unknown()).default({}),
  hreflang: z.array(HreflangItemSchema).default([]),
  robots: z.string().default('index, follow'),
})

const ContentSchema = z.object({
  markdown: z.string().default(''),
  html: z.string().default(''),
  wordCount: z.number().default(0),
})

const ScoresSchema = z.object({
  seo: z.number().nullable().default(null),
  readability: z.number().nullable().default(null),
  contentDepth: z.number().nullable().default(null),
  intentMatch: z.number().nullable().default(null),
  redundancy: z.number().nullable().default(null),
  gap: z.number().nullable().default(null),
  geo: z.number().nullable().default(null),
})

const PipelineSchema = z.object({
  status: z.string(),
  version: z.number().optional(),
  completedSteps: z.array(z.string()).default([]),
  cost: z
    .object({
      tokens: z.number().optional(),
      estimatedCost: z.number().optional(),
    })
    .optional(),
})

export const ContentPageSchema = z.object({
  pageId: z.number(),
  slug: z.string(),
  language: z.string(),
  title: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  content: ContentSchema,
  seo: SeoSchema,
  toc: z.array(TocItemSchema).default([]),
  breadcrumbs: z.array(BreadcrumbItemSchema).default([]),
  faq: z.array(FaqItemSchema).default([]),
  scores: ScoresSchema,
  pipeline: PipelineSchema,
  heroImage: z.string().nullable().default(null),
  publishedAt: z.string().nullable().default(null),
  updatedAt: z.string(),
})

export const ContentListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  language: z.string(),
  updatedAt: z.string(),
})

export const ContentListSchema = z.array(ContentListItemSchema)

export type ContentPage = z.infer<typeof ContentPageSchema>
export type ContentListItem = z.infer<typeof ContentListItemSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
export type TocItem = z.infer<typeof TocItemSchema>
export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>
