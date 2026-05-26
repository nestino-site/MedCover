function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function normalizeHeroImage(
  raw: unknown,
  root: Record<string, unknown>,
): Record<string, unknown> | null {
  if (typeof raw === 'string') {
    const url = raw.trim()
    return url ? { url, alt: null, width: 1200, height: 630 } : null
  }

  const hero = asRecord(raw)
  if (hero) {
    const url = pickString(hero.url, hero.src, hero.href)
    return {
      url: url ?? null,
      alt: pickString(hero.alt) ?? null,
      width: typeof hero.width === 'number' ? hero.width : 1200,
      height: typeof hero.height === 'number' ? hero.height : 630,
    }
  }

  const cdnUrl = pickString(
    root.generatedImageCdnUrl,
    root.generated_image_cdn_url,
    root.heroImageUrl,
    root.hero_image_url,
  )

  if (cdnUrl) {
    return { url: cdnUrl, alt: null, width: 1200, height: 630 }
  }

  return null
}

function normalizeSeo(raw: unknown): unknown {
  const seo = asRecord(raw)
  if (!seo) return raw

  const og =
    asRecord(seo.og) ??
    asRecord(seo.openGraph) ??
    asRecord(seo.open_graph)

  if (og && seo.og == null) {
    seo.og = {
      title: pickString(og.title),
      description: pickString(og.description),
      image: pickString(og.image, og.imageUrl, og.image_url),
      type: pickString(og.type) ?? 'article',
      url: pickString(og.url) ?? '',
    }
  }

  const twitter =
    asRecord(seo.twitter) ??
    asRecord(seo.twitterCard) ??
    asRecord(seo.twitter_card)

  if (twitter && seo.twitter == null) {
    seo.twitter = {
      card: pickString(twitter.card) ?? 'summary_large_image',
      title: pickString(twitter.title),
      description: pickString(twitter.description),
      image: pickString(twitter.image, twitter.imageUrl, twitter.image_url),
    }
  }

  if (seo.canonical == null) {
    seo.canonical = pickString(seo.canonicalUrl, seo.canonical_url) ?? ''
  }

  if (seo.robotsMeta == null) {
    seo.robotsMeta = pickString(seo.robots, seo.robots_meta) ?? 'index, follow'
  }

  return seo
}

/**
 * Normalize Nestino / Traffic Engine payload shape differences before Zod validation.
 * Handles string heroImage URLs, snake_case aliases, and legacy SEO field names.
 */
export function normalizePagePayload(raw: unknown): unknown {
  const root = asRecord(raw)
  if (!root) return raw

  if (root.hero_image !== undefined && root.heroImage === undefined) {
    root.heroImage = root.hero_image
  }

  const normalizedHero = normalizeHeroImage(root.heroImage, root)
  if (normalizedHero) {
    root.heroImage = normalizedHero
  }

  if (root.seo !== undefined) {
    root.seo = normalizeSeo(root.seo)
  }

  if (root.pageId === undefined && root.page_id !== undefined) {
    root.pageId = root.page_id
  }

  if (root.pageId === undefined && root.id !== undefined && typeof root.id === 'number') {
    root.pageId = root.id
  }

  if (root.hasHeroImage === undefined && root.has_hero_image !== undefined) {
    root.hasHeroImage = root.has_hero_image
  }

  if (root.hasHeroImage === undefined) {
    const hero = asRecord(root.heroImage)
    const seo = asRecord(root.seo)
    const og = seo ? asRecord(seo.og) ?? asRecord(seo.openGraph) : null
    root.hasHeroImage = Boolean(
      pickString(
        hero?.url,
        hero?.src,
        root.generatedImageCdnUrl,
        root.generated_image_cdn_url,
        og?.image,
        og?.imageUrl,
      ),
    )
  }

  if (root.html_content !== undefined && root.htmlContent === undefined) {
    root.htmlContent = root.html_content
  }

  if (root.final_content !== undefined && root.finalContent === undefined) {
    root.finalContent = root.final_content
  }

  return root
}
