import type { FaqItem } from '../api/types'
import { buildBreadcrumbList, buildFAQPage, buildOrganization } from './base'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

const TREATMENT_DATA: Record<
  string,
  { name: string; procedureType: string; bodyLocation: string; description: string }
> = {
  ivf: {
    name: 'IVF (In Vitro Fertilization)',
    procedureType: 'Therapeutic procedure',
    bodyLocation: 'Reproductive system',
    description:
      'In vitro fertilization (IVF) is a series of procedures used to help with fertility or prevent genetic problems and assist with the conception of a child.',
  },
  dental: {
    name: 'Dental Treatment',
    procedureType: 'Therapeutic procedure',
    bodyLocation: 'Oral cavity',
    description: 'Comprehensive dental procedures including implants, veneers, and cosmetic dentistry performed abroad.',
  },
  hair: {
    name: 'Hair Transplant',
    procedureType: 'Surgical procedure',
    bodyLocation: 'Scalp',
    description: 'Hair restoration surgery including FUE and FUT transplant techniques performed by specialist clinics abroad.',
  },
  cosmetic: {
    name: 'Cosmetic Surgery',
    procedureType: 'Surgical procedure',
    bodyLocation: 'Various',
    description: 'Elective cosmetic procedures performed by board-certified surgeons at internationally accredited clinics abroad.',
  },
}

export function buildTreatmentPageSchemas(params: {
  treatmentId: string
  canonicalUrl: string
  metaTitle: string
  metaDescription: string
  countries: Array<{ name: string; href: string; countryKey: string }>
  faqs?: FaqItem[]
}): object[] {
  const { treatmentId, canonicalUrl, metaTitle, metaDescription, countries, faqs = [] } = params
  const data = TREATMENT_DATA[treatmentId] ?? TREATMENT_DATA.ivf

  const medicalProcedure = {
    '@type': 'MedicalProcedure',
    '@id': `${canonicalUrl}#procedure`,
    name: data.name,
    procedureType: { '@type': 'MedicalProcedureType', name: data.procedureType },
    bodyLocation: data.bodyLocation,
    description: data.description,
    url: canonicalUrl,
  }

  const medicalWebPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: metaTitle,
    description: metaDescription,
    inLanguage: 'en',
    author: buildOrganization(),
    publisher: buildOrganization(),
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'MedCover',
      url: SITE_URL,
    },
    medicalAudience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
    about: medicalProcedure,
    specialty: { '@type': 'MedicalSpecialty', name: 'Obstetrics' },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const breadcrumbs = [
    { name: 'Home', slug: '/', position: 1 },
    { name: 'Treatments', slug: '/treatments', position: 2 },
    { name: data.name, slug: `/treatments/${treatmentId}`, position: 3 },
  ]

  const schemas: object[] = [
    medicalWebPage,
    { '@context': 'https://schema.org', ...buildBreadcrumbList(breadcrumbs) },
  ]

  if (countries.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Countries offering ${data.name} abroad`,
      itemListElement: countries.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        url: `${SITE_URL}${c.href}`,
      })),
    })
  }

  if (faqs.length > 0) {
    schemas.push({ '@context': 'https://schema.org', ...buildFAQPage(faqs) })
  }

  return schemas
}
