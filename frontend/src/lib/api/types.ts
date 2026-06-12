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
  pageId: z.number().nullable().default(null),
  hasHeroImage: z.boolean().default(false),
  finalContent: z.string().nullable().default(null),
  htmlContent: z.string().nullable().default(null),
  language: z.string().default('en'),
  publishedAt: z.string().nullable().default(null),
  updatedAt: z.string().optional().default(() => new Date().toISOString()),
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

const EntityRefSchema = z.object({
  slug: z.string(),
  name: z.string(),
})

const PageEntitiesSchema = z.object({
  country: EntityRefSchema.optional(),
  city: EntityRefSchema.optional(),
  treatment: EntityRefSchema.optional(),
  clinics: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    urlPath: z.string(),
  })).optional(),
})

// `pageType`, `title` and `entities` are optional v2.2 additions
// (see Docs/GUIDE_LANDING_RELATIONS.md) — older backends omit them.
export const ContentListItemSchema = z.object({
  id: z.number(),
  slug: z.string(),
  language: z.string(),
  updatedAt: z.string(),
  pageType: z.string().optional(),
  title: z.string().optional(),
  entities: PageEntitiesSchema.optional(),
})

export const ContentListResponseSchema = z.object({
  items: z.array(ContentListItemSchema),
})

export const ContentPageSchemaV22 = ContentPageSchema.extend({
  pageType: z.string().optional(),
  entities: PageEntitiesSchema.optional(),
  contentBlocks: z.array(z.object({
    id: z.string(),
    type: z.string(),
    data: z.record(z.string(), z.unknown()),
  })).optional(),
})

// ─── Catalog API types ───────────────────────────────────────────────────────

const CityTaxonomySchema = z.object({
  slug: z.string(),
  name: z.string(),
  clinicCount: z.number(),
})

const CountryTaxonomySchema = z.object({
  slug: z.string(),
  name: z.string(),
  codeIso2: z.string().optional(),
  flagEmoji: z.string().optional(),
  clinicCount: z.number(),
  cities: z.array(CityTaxonomySchema).default([]),
})

const TreatmentTaxonomySchema = z.object({
  slug: z.string(),
  code: z.string(),
  name: z.string(),
  clinicCount: z.number(),
  countries: z.array(z.string()).default([]),
})

export const TaxonomySchema = z.object({
  countries: z.array(CountryTaxonomySchema),
  treatments: z.array(TreatmentTaxonomySchema),
  updatedAt: z.string().optional(),
})

const TruthScoreSchema = z.object({
  composite: z.number().nullable(),
  grade: z.string().nullable(),
  dimensionScores: z.record(z.string(), z.number()).optional(),
  interviewCount: z.number().optional(),
  lastComputedAt: z.string().optional(),
}).nullable()

const PriceRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currency: z.string(),
}).nullable()

const TreatmentRefSchema = z.object({
  code: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const ClinicCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  urlPath: z.string(),
  photoUrl: z.string().nullable().optional(),
  googleRating: z.number().nullable().optional(),
  googleReviewCount: z.number().nullable().optional(),
  truthScore: TruthScoreSchema.optional(),
  treatments: z.array(TreatmentRefSchema).default([]),
  priceRange: PriceRangeSchema.optional(),
  city: EntityRefSchema.optional(),
  country: EntityRefSchema.optional(),
  editorialSummary: z.string().nullable().optional(),
  interviewCount: z.number().optional(),
})

export const ClinicListResponseSchema = z.object({
  items: z.array(ClinicCardSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

const ClinicMediaSchema = z.object({
  url: z.string(),
  caption: z.string().nullable().optional(),
  kind: z.enum(['PHOTO', 'LOGO', 'VIDEO']).optional(),
  isPrimary: z.boolean().optional(),
})

const PricingPackageSchema = z.object({
  treatmentType: z.string(),
  priceMin: z.number(),
  priceMax: z.number(),
  currency: z.string(),
  packageName: z.string().optional(),
  basePrice: z.number().optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  lastVerifiedAt: z.string().nullable().optional(),
})

const DoctorSchema = z.object({
  name: z.string(),
  title: z.string().nullable().optional(),
  specialties: z.array(z.string()).optional(),
  photoUrl: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
})

const GoogleReviewSchema = z.object({
  text: z.string().optional(),
  authorName: z.string().optional(),
  rating: z.number().optional(),
  time: z.number().optional(),
})

const AccreditationSchema = z.object({
  code: z.string(),
  name: z.string(),
  regulator: z.string().nullable().optional(),
})

const PatientInterviewSchema = z.object({
  ageBucket: z.string().optional(),
  originCountry: z.string().optional(),
  treatmentCode: z.string().optional(),
  completedYear: z.number().optional(),
  quotes: z.unknown().optional(),
})

export const ClinicDetailSchema = ClinicCardSchema.extend({
  addressLine: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  googleMapsUrl: z.string().nullable().optional(),
  openingHours: z.unknown().optional(),
  media: z.array(ClinicMediaSchema).default([]),
  doctors: z.array(DoctorSchema).default([]),
  googleReviews: z.array(GoogleReviewSchema).default([]),
  pricingPackages: z.array(PricingPackageSchema).default([]),
  longDescription: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  accreditations: z
    .array(z.union([z.string(), AccreditationSchema]))
    .default([])
    .transform((items) =>
      items.map((item) =>
        typeof item === 'string'
          ? { code: item, name: item, regulator: null }
          : item,
      ),
    ),
  interviews: z.array(PatientInterviewSchema).default([]),
  languages: z.array(z.string()).optional(),
  foundedYear: z.number().nullable().optional(),
  doctorsCount: z.number().nullable().optional(),
  inHouseLab: z.boolean().optional(),
  interviewCount: z.number().optional(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
})

const CostAggregateSchema = z.object({
  min: z.number(),
  max: z.number(),
  avg: z.number().optional(),
  currency: z.string(),
  sampleSize: z.number().optional(),
  updatedAt: z.string().optional(),
  clinicCount: z.number().optional(),
})

export const CostsResponseSchema = z.object({
  treatment: EntityRefSchema,
  overall: CostAggregateSchema.nullable().optional(),
  byCountry: z.array(z.object({
    country: EntityRefSchema,
    min: z.number(),
    max: z.number(),
    avg: z.number().optional(),
    currency: z.string(),
    clinicCount: z.number().optional(),
  })).default([]),
  byCity: z.array(z.object({
    city: EntityRefSchema,
    country: EntityRefSchema,
    min: z.number(),
    max: z.number(),
    avg: z.number().optional(),
    currency: z.string(),
    clinicCount: z.number().optional(),
  })).default([]),
  topClinics: z.array(ClinicCardSchema).default([]),
})

const CompareEntitySchema = z.object({
  name: z.string(),
  slug: z.string(),
  clinicCount: z.number().optional(),
  avgRating: z.number().nullable().optional(),
  priceRange: PriceRangeSchema.optional(),
  truthScoreAvg: z.number().nullable().optional(),
  topClinics: z.array(ClinicCardSchema).default([]),
})

export const CompareResponseSchema = z.object({
  type: z.enum(['clinic', 'city', 'country']),
  treatment: EntityRefSchema.optional(),
  entityA: CompareEntitySchema,
  entityB: CompareEntitySchema,
})

export const SearchResponseSchema = z.object({
  clinics: z.array(ClinicCardSchema).default([]),
  treatments: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    clinicCount: z.number().optional(),
  })).default([]),
  countries: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    clinicCount: z.number().optional(),
  })).default([]),
  cities: z.array(z.object({
    slug: z.string(),
    name: z.string(),
    country: z.string().optional(),
    clinicCount: z.number().optional(),
  })).default([]),
  guides: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })).default([]),
  suggestions: z.object({
    countries: z.array(z.object({
      slug: z.string(),
      name: z.string(),
      clinicCount: z.number().optional(),
    })).default([]),
    treatments: z.array(z.object({
      slug: z.string(),
      name: z.string(),
      clinicCount: z.number().optional(),
    })).default([]),
  }).optional(),
})

// ContentPage is the v2.2 shape: a strict superset of v2.1 (all additions
// optional), so v2.1 payloads parse unchanged.
export type ContentPage = z.infer<typeof ContentPageSchemaV22>
export type ContentPageV22 = z.infer<typeof ContentPageSchemaV22>
export type ContentListItem = z.infer<typeof ContentListItemSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
export type TocItem = z.infer<typeof TocItemSchema>
export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>
export type HeroImage = z.infer<typeof HeroImageSchema>
export type Taxonomy = z.infer<typeof TaxonomySchema>
export type ClinicCard = z.infer<typeof ClinicCardSchema>
export type ClinicDetail = z.infer<typeof ClinicDetailSchema>
export type ClinicListResponse = z.infer<typeof ClinicListResponseSchema>
export type CostsResponse = z.infer<typeof CostsResponseSchema>
export type CompareResponse = z.infer<typeof CompareResponseSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type PageEntities = z.infer<typeof PageEntitiesSchema>
