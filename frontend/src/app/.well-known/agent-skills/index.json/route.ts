import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// Agent Skills Discovery RFC v0.2.0 — https://github.com/cloudflare/agent-skills-discovery-rfc
export function GET() {
  const index = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'insurance-comparison',
        type: 'skill-md',
        description: 'Compare health insurance plans across Iranian providers available on MedCover.',
        url: `${SITE_URL}/.well-known/agent-skills/insurance-comparison/SKILL.md`,
        digest: 'sha256:6f86c46fcae2a5d4acf93d75dd159773c9a88cc602ec769170eeda7484aa1fd7',
      },
      {
        name: 'coverage-explanation',
        type: 'skill-md',
        description: 'Retrieve a detailed explanation of what a specific health insurance plan covers.',
        url: `${SITE_URL}/.well-known/agent-skills/coverage-explanation/SKILL.md`,
        digest: 'sha256:fd19cd064f288c5f18010ddd978daa574d585060697c08fceafd388bbbd63a51',
      },
      {
        name: 'plan-recommendation',
        type: 'skill-md',
        description: 'Get AI-powered health insurance plan recommendations tailored to a user\'s needs.',
        url: `${SITE_URL}/.well-known/agent-skills/plan-recommendation/SKILL.md`,
        digest: 'sha256:bfb84bd35da58d649c40154e78068493c2820d760926b4bb9a31e6e07b269d73',
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
