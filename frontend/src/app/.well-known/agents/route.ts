import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// DNS-AID agent index — draft-mozleywilliams-dnsop-dnsaid
export function GET() {
  const index = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MedCover AI Agent Index',
    description: 'AI agents available at medcover.io for health insurance discovery and comparison',
    url: `${SITE_URL}/.well-known/agents`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'SoftwareApplication',
          name: 'MedCover Insurance Advisor',
          applicationCategory: 'HealthApplication',
          description: 'AI agent for discovering, comparing, and explaining health insurance coverage options in Iran',
          url: `${SITE_URL}/.well-known/a2a`,
          protocol: 'a2a',
          capabilities: [
            'insurance-comparison',
            'coverage-explanation',
            'plan-recommendation',
          ],
        },
      },
    ],
  }

  return NextResponse.json(index, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
