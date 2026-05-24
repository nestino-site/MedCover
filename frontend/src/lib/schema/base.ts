import type { BreadcrumbItem, FaqItem } from '../api/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'
const ORG_NAME = 'MedCover'

export function buildOrganization() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/medcover-logo.svg`,
      width: 160,
      height: 40,
    },
    sameAs: [SITE_URL],
  }
}

export function buildBreadcrumbList(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.slug}`,
    })),
  }
}

export function buildFAQPage(faqs: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function buildMedicalWebPage(params: {
  url: string
  name: string
  description: string
  language: string
  publishedAt: string | null
  updatedAt: string
}) {
  return {
    '@type': 'MedicalWebPage',
    '@id': `${params.url}#webpage`,
    url: params.url,
    name: params.name,
    description: params.description,
    inLanguage: params.language.toLowerCase(),
    datePublished: params.publishedAt ?? params.updatedAt,
    dateModified: params.updatedAt,
    lastReviewed: params.updatedAt,
    author: buildOrganization(),
    publisher: buildOrganization(),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: ORG_NAME,
      url: SITE_URL,
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    about: {
      '@type': 'MedicalProcedure',
      name: 'IVF (In Vitro Fertilization)',
    },
  }
}
