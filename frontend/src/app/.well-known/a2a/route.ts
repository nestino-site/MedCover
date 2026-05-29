import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// Agent-to-Agent (A2A) protocol discovery card — DNS-AID / Google A2A spec
export function GET() {
  const agentCard = {
    name: 'MedCover Insurance Advisor',
    description:
      'AI agent for discovering, comparing, and explaining health insurance coverage options',
    url: `${SITE_URL}/.well-known/a2a`,
    version: '1.0',
    provider: {
      organization: 'MedCover',
      url: SITE_URL,
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: [
      {
        id: 'insurance-comparison',
        name: 'Insurance Plan Comparison',
        description: 'Compare health insurance plans across providers',
        tags: ['insurance', 'health', 'comparison'],
        examples: ['Compare basic vs. comprehensive health plans'],
      },
      {
        id: 'coverage-explanation',
        name: 'Coverage Explanation',
        description: 'Explain what a health insurance plan covers',
        tags: ['insurance', 'coverage', 'explanation'],
        examples: ['What does this plan cover for outpatient visits?'],
      },
      {
        id: 'plan-recommendation',
        name: 'Plan Recommendation',
        description: 'Recommend suitable health insurance plans based on user needs',
        tags: ['insurance', 'recommendation', 'personalization'],
        examples: ['Which plan is best for a family of four?'],
      },
    ],
  }

  return NextResponse.json(agentCard, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
