# Compare Pages — Traffic Engine Backend Spec

**Audience:** NestJS / Traffic Engine backend team  
**Consumer:** MedCover Next.js frontend (`SITE_ID=2`)  
**Date:** June 2026

## 1. Problem

Compare landing pages are not rendering with real comparison data. The frontend is wired to call `GET /content/compare`, but pages only pre-rendered when compare slugs existed in the CMS page list. Unlike `/content/costs/{treatment}` and `/content/clinics`, the compare catalog endpoint appears missing or incomplete, and CMS slugs may still use the legacy URL format.

The frontend has been updated to generate compare routes from taxonomy (country, city, and clinic pairs) even without CMS pages. **CMS editorial content remains a bonus layer, not a prerequisite for page existence.**

---

## 2. Goal

Implement compare support using the **same architecture as costs and clinics**:

1. **Catalog API** — structured comparison data (clinic counts, ratings, price ranges, top clinics)
2. **CMS overlay** — optional editorial HTML, FAQ, SEO metadata per compare slug
3. **Taxonomy** — entity validation and page discovery

---

## 3. Canonical URL & slug format

### Canonical format

| Compare type | Public URL | CMS slug (`/content/by-slug`) |
|-------------|-----------|-------------------------------|
| Country vs country | `/compare/{a}-vs-{b}-{treatment}/` | `/compare/{a}-vs-{b}-{treatment}` |
| City vs city | `/compare/{a}-vs-{b}-{treatment}/` | `/compare/{a}-vs-{b}-{treatment}` |
| Clinic vs clinic | `/compare/{a}-vs-{b}/` | `/compare/{a}-vs-{b}` |

**Rules:**

- `{a}` and `{b}` are URL slugs, alphabetically ordered (`canonicalPair`: `greece-vs-spain`, never `spain-vs-greece`)
- `{treatment}` is the canonical treatment slug (e.g. `ivf`, `hair-transplant`)
- Trailing slash on public URLs; no trailing slash on API slugs
- Legacy `/compare/{a}-vs-{b}-for-{treatment}/` should redirect (301) to `/compare/{a}-vs-{b}-{treatment}/`

### Entity type disambiguation

Country and city comparisons share the same URL shape. The frontend passes an explicit `type` query parameter. **The backend must not infer type from slug alone.**

---

## 4. Required API: `GET /content/compare`

### Request

```
GET /api/v1/content/compare?type={clinic|city|country}&a={slug}&b={slug}&treatment={slug}
```

| Param | Required | Description |
|-------|----------|-------------|
| `type` | yes | `country`, `city`, or `clinic` |
| `a` | yes | First entity slug (canonical order) |
| `b` | yes | Second entity slug (canonical order) |
| `treatment` | yes for country/city; omit for clinic | Canonical treatment slug |

**Headers** (same as all catalog endpoints):

- `X-Site-Api-Key`
- `X-Site-Id`

### Response `200` — must match this schema

```json
{
  "type": "country",
  "treatment": { "slug": "ivf", "name": "IVF & Fertility" },
  "entityA": {
    "name": "Greece",
    "slug": "greece",
    "clinicCount": 42,
    "avgRating": 4.6,
    "priceRange": { "min": 3500, "max": 6500, "currency": "EUR" },
    "truthScoreAvg": 78.5,
    "topClinics": [
      {
        "slug": "genesis-athens",
        "name": "Genesis Athens Clinic",
        "urlPath": "/clinics/greece/athens/genesis-athens/",
        "googleRating": 4.8,
        "googleReviewCount": 214,
        "country": { "slug": "greece", "name": "Greece" },
        "city": { "slug": "athens", "name": "Athens" },
        "treatments": [{ "code": "IVF", "name": "IVF & Fertility", "slug": "ivf" }]
      }
    ]
  },
  "entityB": {
    "name": "Spain",
    "slug": "spain",
    "clinicCount": 67,
    "avgRating": 4.7,
    "priceRange": { "min": 4200, "max": 7800, "currency": "EUR" },
    "truthScoreAvg": 81.2,
    "topClinics": []
  }
}
```

### Response rules per `type`

| type | `a` / `b` refer to | `treatment` | Data sources |
|------|-------------------|-------------|--------------|
| `country` | Country slugs from taxonomy | Required | Aggregate clinics + pricing packages filtered by country + treatment |
| `city` | City slugs from taxonomy | Required | Same, scoped to city |
| `clinic` | Clinic slugs (globally unique per site) | Omit | Direct clinic records; compare ratings, truth scores, pricing for shared treatments |

### Error responses

| Status | When |
|--------|------|
| `400` | Missing/invalid `type`, missing `treatment` for country/city, unknown entity slug |
| `404` | Valid params but no clinics/data for this comparison |
| `200` with empty `topClinics` | Acceptable if aggregate stats exist |

### Data computation guidance

Mirror the logic used for `GET /content/costs/{treatment}`:

- `priceRange` = min/max from verified pricing packages for the scope
- `clinicCount` = published clinics matching scope
- `avgRating` = mean `googleRating` across matching clinics (nullable if no ratings)
- `truthScoreAvg` = mean composite truth score (nullable)
- `topClinics` = top 3 by truth score or rating, same shape as `ClinicCard` in `/content/clinics`

---

## 5. CMS page requirements

### Page list (`GET /content/pages`)

Compare pages should appear with:

- `slug`: canonical format from section 3
- `pageType`: `"COMPARISON"` (or `"comparison"`)
- `entities` (v2.2 tags, recommended):

```json
{
  "country": { "slug": "greece", "name": "Greece" },
  "treatment": { "slug": "ivf", "name": "IVF & Fertility" }
}
```

For city comparisons, set `city` instead of `country`. For clinic comparisons, set `clinics: [{ slug, name, urlPath }, ...]`.

### Page detail (`GET /content/by-slug/compare/{slug}`)

Return standard `ContentPage` v2.1/v2.2 payload with:

- `htmlContent` — editorial comparison (Quick Verdict, FAQ, etc.)
- `faq[]` — 8–12 cross-country questions
- `seo.canonical` — must match new URL format
- `schemaMarkup` — Article + FAQPage + BreadcrumbList

See template spec: `Docs/MedCoverSEO.MD` → Template C (Comparison Page).

### Slug migration

If existing CMS pages use legacy slugs (`/compare/spain-vs-greece-for-ivf`):

- **Option A (preferred):** Migrate slugs to `/compare/greece-vs-spain-ivf`
- **Option B:** Alias both slugs to the same content in `by-slug` lookup

The frontend already falls back to legacy `-for-{treatment}` CMS slugs when loading editorial content.

---

## 6. Bulk page generation (recommended backend job)

The frontend auto-generates routes from taxonomy, but **CMS editorial content** should be produced by the backend content pipeline.

### Country comparisons (priority)

For each treatment in taxonomy, generate all canonical country pairs where both countries have `clinicCount > 0`:

```
treatments: [ivf, hair-transplant, ...]
countries per treatment: from taxonomy.treatments[].countries
pairs: C(n,2) with canonical ordering
```

Example slugs to publish:

- `/compare/czech-republic-vs-spain-ivf`
- `/compare/greece-vs-spain-ivf`
- `/compare/greece-vs-spain-hair-transplant`

### City comparisons

For each treatment, within each country, generate canonical pairs of cities with `clinicCount > 0`:

- `/compare/athens-vs-thessaloniki-ivf`
- `/compare/barcelona-vs-madrid-ivf`

### Clinic comparisons

Do **not** generate all clinic pairs (combinatorial explosion). Recommended:

- Top 3 clinics per city by truth score → max 3 pairs per city
- Or publish only high-traffic pairs identified by SEO research

Example:

- `/compare/clinic-a-slug-vs-clinic-b-slug` (no treatment suffix)

---

## 7. Webhook / cache invalidation

On `page.published`, `page.updated`, `clinic.updated`, `clinic.published` events affecting compare entities, include in `affectedPaths`:

```
/compare/greece-vs-spain-ivf/
/compare/
```

The frontend revalidates compare catalog cache tags when it detects `/compare/` paths.

---

## 8. Acceptance checklist

- [ ] `GET /content/compare?type=country&a=greece&b=spain&treatment=ivf` returns valid JSON matching schema above
- [ ] `GET /content/compare?type=city&a=athens&b=thessaloniki&treatment=ivf` returns city-scoped data
- [ ] `GET /content/compare?type=clinic&a={slug}&b={slug}` returns clinic-scoped data
- [ ] Invalid entity slugs return `400` or `404` (not `500`)
- [ ] CMS pages use canonical slug format `/compare/{a}-vs-{b}-{treatment}`
- [ ] `GET /content/pages` lists compare pages with `pageType: COMPARISON`
- [ ] `GET /content/by-slug/compare/greece-vs-spain-ivf` returns editorial content
- [ ] Legacy `-for-{treatment}` slugs migrated or aliased
- [ ] Taxonomy includes all countries/cities/clinics referenced in compare slugs

---

## 9. Reference: existing working endpoints

Implement compare following the same patterns as:

| Endpoint | Purpose |
|----------|---------|
| `GET /content/taxonomy` | Entity validation, static param generation |
| `GET /content/costs/{treatment}?country=&city=` | Price aggregation logic to reuse |
| `GET /content/clinics?country=&city=&treatment=` | Clinic listing logic to reuse |
| `GET /content/pages` | CMS discovery |
| `GET /content/by-slug/{slug}` | Editorial overlay |

**Frontend contract files:**

- Zod schema: `frontend/src/lib/api/types.ts` → `CompareResponseSchema`
- API client: `frontend/src/lib/api/catalog.ts` → `getCompare()`
- URL builders: `frontend/src/lib/routes.ts` → `compareCountryPath`, `compareCityPath`, `compareClinicPath`
- Static param generation: `frontend/src/lib/compare/static-params.ts`
