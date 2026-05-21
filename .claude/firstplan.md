
# MedCover Frontend — V1 Plan

## Context

MedCover is an IVF / medical tourism clinic discovery platform. The backend (`nestino-backend`) is a NestJS content generation system that uses AI pipelines to produce SEO/AEO-optimized HTML pages and serves them via a content API. This plan covers building the **first Next.js frontend client** that consumes that API.

The goal for V1 is maximal SEO/AEO performance on exactly two page types:
- **Country Destination Guide** (`/guides/[country]-ivf-guide/`) — Template A
- **City Destination Guide** (`/guides/[country]/[city]-ivf-guide/`) — Template A2

---

## Backend API Contract (Key Facts)

- Base URL: `NEXT_PUBLIC_API_URL` env var (backend runs on port 3001)
- Content delivery: `GET /api/v1/content/by-slug/*path`
- Headers required: `X-Site-Api-Key`, `X-Site-Id`
- Content list: `GET /api/v1/content/pages`
- Webhook for on-demand revalidation: backend fires `POST {publishWebhookUrl}` with HMAC-SHA256 signature on `page.published` and `page.updated`
- Response shape (critical fields):
  ```typescript
  {
    pageId, slug, language, title, metaTitle, metaDescription,
    content: { markdown, html, wordCount },
    seo: { canonicalUrl, openGraph, twitterCard, hreflang[], robots },
    toc: [{ text, level, id }],
    breadcrumbs: [{ name, path }],
    faq: [{ question, answer }],
    scores: { seo, readability, contentDepth, intentMatch, redundancy, gap, geo },
    heroImage: string | null,
    publishedAt, updatedAt
  }
  ```

---

## Structural Separation Principles

The frontend and backend are **fully independent deployable units** — different repos, different runtimes, different CI/CD. The only contract between them is the HTTP API. This is enforced structurally:

1. **API boundary via Zod** — All backend response shapes are defined and validated in `lib/api/types.ts`. If the backend changes a field name or adds a breaking change, the Zod parse fails immediately, surfacing the contract break at the boundary — not deep in a component.

2. **Zero shared code** — No shared TypeScript types, no monorepo workspace imports. Each side owns its own types. The frontend's Zod schemas are the source of truth for what the frontend expects; the backend's Prisma models are the source of truth for what exists.

3. **Environment-only coupling** — The only runtime coupling is 3 env vars: `API_BASE_URL`, `SITE_API_KEY`, `SITE_ID`. Swapping to a different backend or staging environment is a single env file change.

4. **`lib/api/` is the wall** — No component ever imports `fetch` directly. All backend communication goes through `lib/api/content.ts`. Moving to a different API layer (GraphQL, tRPC, REST v2) means changing only this folder.

5. **Server-only API code** — `lib/api/client.ts` uses `server-only` package guard. No API keys can accidentally leak to the client bundle.

6. **Independently scalable** — Frontend deploys to Vercel Edge. Backend deploys separately (Railway, Fly.io, AWS). Neither is aware of the other's infrastructure.

```
┌─────────────────────────────┐     HTTP only     ┌────────────────────────────┐
│   medcover-frontend/        │  ←─────────────→  │  nestino-backend/          │
│   Next.js 15 App Router     │  X-Site-Api-Key    │  NestJS + PostgreSQL       │
│   Vercel Edge               │  X-Site-Id         │  Railway / Fly.io          │
│                             │                    │                            │
│   lib/api/ (the wall)       │                    │  /api/v1/content/...       │
│   ├── client.ts (server-only)│                   │  /api/v1/sites/...         │
│   ├── types.ts (Zod)        │                    │  publishWebhookUrl →       │
│   └── content.ts            │  ←── webhook ───   │    medcover.com/api/revalidate│
└─────────────────────────────┘                    └────────────────────────────┘
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | ISR, RSC, Edge, best-in-class SEO |
| Language | TypeScript strict | Type safety across API boundary |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` | Zero-runtime CSS, `prose` for content HTML |
| Font | Geist (via `next/font`) | Clean Nordic look, Vercel-native, no FOUT |
| Components | Radix UI primitives (accordion, dialog, slot) | Accessible, headless, lightweight |
| Utilities | clsx + tailwind-merge | Conditional class composition |
| Icons | Lucide React | Consistent, tree-shakeable |
| Validation | Zod | Validate API response shape at boundary |
| Content rendering | `dangerouslySetInnerHTML` inside `prose` | Backend delivers pre-rendered HTML |

---

## Project Location

```
/Users/mosiho/MedCover/frontend/
```

---

## File Structure

```
frontend/
├── .env.local                          # API_BASE_URL, SITE_API_KEY, SITE_ID, REVALIDATE_SECRET
├── .env.example
├── next.config.ts                      # trailingSlash, images, security headers, compress
├── tailwind.config.ts
├── components.json                     # shadcn/ui config (minimal)
├── middleware.ts                       # Security headers at edge
├── public/
│   └── medcover-logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root — Geist font, HTML lang, providers
│   │   ├── globals.css                 # @theme block with all design tokens
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts                  # Dynamic from getContentList()
│   │   ├── robots.ts
│   │   ├── guides/
│   │   │   ├── [countrySlug]/
│   │   │   │   └── page.tsx            # Template A — Country Guide RSC
│   │   │   └── [countrySlug]/
│   │   │       └── [citySlug]/
│   │   │           └── page.tsx        # Template A2 — City Guide RSC
│   │   └── api/
│   │       └── revalidate/
│   │           └── route.ts            # POST — HMAC webhook handler
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # RSC — logo, nav, lang placeholder
│   │   │   ├── MobileMenu.tsx          # Client — open/close state
│   │   │   ├── Footer.tsx              # RSC
│   │   │   ├── Breadcrumb.tsx          # RSC — from page.breadcrumbs
│   │   │   └── TableOfContents.tsx     # Client — IntersectionObserver
│   │   ├── shared/
│   │   │   ├── JsonLd.tsx              # RSC — <script type="application/ld+json">
│   │   │   ├── FaqAccordion.tsx        # Client — accordion state
│   │   │   ├── CtaBlock.tsx            # RSC
│   │   │   ├── HeroImage.tsx           # RSC — next/image priority
│   │   │   ├── SpeakableSummary.tsx    # RSC — data-speakable attr
│   │   │   └── ContentHtml.tsx         # RSC — prose wrapper for content.html
│   │   ├── country-guide/              # Template A sections (all RSC)
│   │   │   ├── HeroAnswerBlock.tsx
│   │   │   ├── TruthScoreCard.tsx
│   │   │   ├── KeyStatsTable.tsx
│   │   │   ├── AiInterviewInsights.tsx
│   │   │   ├── MarketingVsReality.tsx
│   │   │   ├── TopClinicsGrid.tsx
│   │   │   ├── CostBreakdown.tsx
│   │   │   ├── LegalContext.tsx
│   │   │   └── ComparisonBlock.tsx
│   │   └── city-guide/                 # Template A2 sections (all RSC)
│   │       ├── CityHeroAnswer.tsx
│   │       ├── CityQuickStats.tsx
│   │       ├── WhyCitySection.tsx
│   │       ├── AllClinicsGrid.tsx
│   │       ├── TravelLogistics.tsx
│   │       └── MiniComparison.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # Fetch wrapper: headers, cache tags, Zod parse
│   │   │   ├── content.ts              # getContentBySlug(), getContentList()
│   │   │   └── types.ts                # Zod schema + inferred TypeScript types
│   │   ├── cache/
│   │   │   └── tags.ts                 # cacheTag.page(slug), cacheTag.list
│   │   ├── schema/
│   │   │   ├── base.ts                 # buildOrganization, buildBreadcrumbList, buildFAQPage
│   │   │   ├── country-guide.ts        # 5-schema array builder for Template A
│   │   │   └── city-guide.ts           # 4-schema array builder for Template A2
│   │   ├── seo/
│   │   │   └── metadata.ts             # generateCountryGuideMetadata, generateCityGuideMetadata
│   │   ├── i18n/
│   │   │   ├── en.ts                   # All EN UI strings (nav, CTA, labels)
│   │   │   └── types.ts
│   │   └── utils/
│   │       └── cn.ts                   # clsx + twMerge
```

---

## Routing Strategy

Both URL patterns use nested dynamic segments:

```
app/guides/[countrySlug]/page.tsx        → /guides/spain-ivf-guide/
app/guides/[countrySlug]/[citySlug]/page.tsx  → /guides/spain/barcelona-ivf-guide/
```

The full path segment is forwarded verbatim to the backend:
```
/guides/spain-ivf-guide/ → GET /api/v1/content/by-slug/guides/spain-ivf-guide
/guides/spain/barcelona-ivf-guide/ → GET /api/v1/content/by-slug/guides/spain/barcelona-ivf-guide
```

Both routes implement:
- `generateStaticParams()` — SSG at build time from `getContentList()`
- `dynamicParams = false` — 404 for unknown slugs
- `generateMetadata()` — async, cache-deduped with page data fetch

---

## API Client Pattern

```typescript
// lib/api/client.ts — server-only
async function apiFetch<T>(path: string, schema: ZodType<T>, tags: string[]): Promise<T> {
  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    headers: {
      'X-Site-Api-Key': process.env.SITE_API_KEY!,
      'X-Site-Id': process.env.SITE_ID!,
    },
    next: { tags, revalidate: false },
  })
  if (!response.ok) throw new Error(`${res.status}`)
  return schema.parse(await res.json())
}
```

Cache tags per fetch:
- Page: `['page:guides/spain-ivf-guide', 'content-list']`
- List: `['content-list']`

---

## On-Demand Revalidation

`POST /api/revalidate` verifies HMAC-SHA256, then calls `revalidateTag('page:<slug>')`. Security via `timingSafeEqual` comparison. Environment var `REVALIDATE_SECRET` must match backend's `publishWebhookSecret`.

Backend must be configured with:
- `publishWebhookUrl = https://medcover.com/api/revalidate`
- `publishWebhookSecret = <shared secret>`
- `autoPublish = true` (or manually triggered)

---

## Schema / JSON-LD

**Country Guide — 5 schemas emitted:**
1. `MedicalWebPage` — name, description, url, inLanguage, datePublished, dateModified, lastReviewed (= updatedAt), author (MedCover Org)
2. `FAQPage` — from `page.faq[]`
3. `BreadcrumbList` — from `page.breadcrumbs[]`
4. `AggregateRating` — ratingValue from scores, ratingCount pattern-matched from content
5. `SpeakableSpecification` — cssSelector `[data-speakable="true"]`

**City Guide — 4 schemas (same minus AggregateRating):**
- `SpeakableSpecification` targets `CityQuickStats` with `data-speakable="true"`

All injected via RSC `<script type="application/ld+json">` in page body, server-side.

---

## Design System

**Palette — Scandinavian Medical Trust:**
- Primary: Deep Nordic Navy `#0f2040` → `primary-900`
- Accent: Nordic Sage green `#4a8a70` → `accent-500`
- Trust amber `#d97706` → CTAs, verified badges, score highlights
- Surface: White + `#f9fafb` subtle
- All tokens via Tailwind v4 `@theme {}` block in `globals.css`

**Typography:**
- Font: Geist via `next/font/google`, subset `latin`, `display: swap`
- H1: 48–72px fluid, weight 700, tracking −0.03em, `primary-950`
- H2: 32–48px fluid, weight 600
- Body: 16–17px fluid, line-height 1.7, `neutral-700`
- Prose content rendered with `@tailwindcss/typography` (`prose prose-neutral`)

**Logo:**
- Simple SVG wordmark: "Med" regular weight + "Cover" semibold, navy `#0f2040`
- Mark: Two overlapping rounded rectangles forming a shield/document shape with cross-negative-space
- Responsive: mark-only at mobile, full lockup at desktop

---

## Core Web Vitals Targets

| Metric | Target | Key Approach |
|---|---|---|
| LCP | < 2.5s | `next/image priority` on hero, all content server-rendered |
| CLS | 0 | Explicit image dimensions, `next/font` eliminates FOUT |
| INP | < 200ms | FAQ accordion only interactive element, no heavy JS libs |
| TTFB | < 200ms | Edge deployment + ISR cache hit |

---

## Packages

```json
"dependencies": {
  "next": "15.x", "react": "^19", "react-dom": "^19",
  "tailwindcss": "^4", "@tailwindcss/typography": "^0.5",
  "geist": "^1.3",
  "@radix-ui/react-accordion": "^1.2",
  "@radix-ui/react-dialog": "^1.1",
  "@radix-ui/react-slot": "^1.1",
  "class-variance-authority": "^0.7", "clsx": "^2.1", "tailwind-merge": "^2.5",
  "lucide-react": "^0.400",
  "zod": "^3.23"
}
```

---

## Implementation Sequence

1. Bootstrap: `npx create-next-app@15 frontend --typescript --tailwind --app --src-dir --turbopack`
2. Install dependencies, configure Geist font
3. Write `globals.css` `@theme` design tokens
4. Build API layer: `client.ts` → `types.ts` (Zod) → `content.ts`
5. Build cache tags + revalidation webhook route
6. Build schema builders (base → country → city)
7. Build layout: Header, Footer, Breadcrumb, JsonLd
8. Build shared components: FaqAccordion, ContentHtml, HeroImage, CtaBlock, SpeakableSummary
9. Build Template A (country guide): route + all section components
10. Build Template A2 (city guide): route + all section components
11. Wire `generateMetadata` + `generateStaticParams` on both routes
12. Build sitemap.ts + robots.ts
13. Middleware: security headers
14. i18n dictionary setup

---

## Verification

- Run `next build` — zero TypeScript errors, all static params generated
- Run `next start` — fetch a country page, verify HTML contains H1 content, FAQ, JSON-LD in `<body>`
- Test revalidation: POST to `/api/revalidate` with correct HMAC signature → `revalidateTag` fires → page refetches fresh content
- Google Rich Results Test on a rendered page URL — FAQPage + BreadcrumbList + MedicalWebPage all valid
- Lighthouse on `/guides/spain-ivf-guide/` — Performance ≥ 95, SEO 100, Accessibility ≥ 90
- Inspect `<head>` for canonical, og:, twitter: meta tags
- Verify `data-speakable="true"` element exists in rendered HTML
- Check sitemap.xml returns correct URLs with lastmod dates
