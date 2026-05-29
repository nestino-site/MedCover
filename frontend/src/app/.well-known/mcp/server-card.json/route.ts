import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// MCP Server Card — SEP-1649 / modelcontextprotocol/modelcontextprotocol#2127
export function GET() {
  const serverCard = {
    schema_version: '0.1.0',
    serverInfo: {
      name: 'MedCover MCP Server',
      version: '1.0.0',
      description:
        'MCP server for health insurance discovery, comparison, and plan recommendation',
      vendor: 'MedCover',
      url: SITE_URL,
    },
    transport: [
      {
        type: 'http',
        url: `${SITE_URL}/api/mcp`,
      },
    ],
    capabilities: {
      tools: {
        supported: true,
      },
      resources: {
        supported: false,
      },
      prompts: {
        supported: false,
      },
      sampling: {
        supported: false,
      },
    },
    tools: [
      {
        name: 'compare_insurance_plans',
        description: 'Compare health insurance plans across providers',
        inputSchema: {
          type: 'object',
          properties: {
            coverage_type: {
              type: 'string',
              description: 'Type of coverage (basic, standard, comprehensive)',
            },
            family_size: {
              type: 'number',
              description: 'Number of family members to cover',
            },
          },
        },
      },
      {
        name: 'explain_coverage',
        description: 'Explain what a specific health insurance plan covers',
        inputSchema: {
          type: 'object',
          properties: {
            plan_id: {
              type: 'string',
              description: 'Identifier of the insurance plan',
            },
          },
          required: ['plan_id'],
        },
      },
      {
        name: 'recommend_plan',
        description: 'Recommend suitable health insurance plans based on user needs',
        inputSchema: {
          type: 'object',
          properties: {
            budget: {
              type: 'number',
              description: 'Monthly budget',
            },
            family_size: {
              type: 'number',
              description: 'Number of family members',
            },
            needs: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific coverage needs (e.g. dental, vision, maternity)',
            },
          },
        },
      },
    ],
  }

  return NextResponse.json(serverCard, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
