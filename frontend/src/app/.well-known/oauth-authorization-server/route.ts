import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// RFC 8414 — OAuth 2.0 Authorization Server Metadata
// MedCover's public APIs require no OAuth authentication.
// Agents may verify HTTP Message Signature keys via jwks_uri.
export function GET() {
  const metadata = {
    issuer: SITE_URL,
    jwks_uri: `${SITE_URL}/.well-known/http-message-signatures-directory`,
    grant_types_supported: [],
    response_types_supported: [],
    token_endpoint_auth_methods_supported: [],
    scopes_supported: [],
    service_documentation: `${SITE_URL}/.well-known/api-catalog`,
    // auth.md agent registration block (https://github.com/workos/auth.md)
    agent_auth: {
      skill: `${SITE_URL}/auth.md`,
      identity_types_supported: ['anonymous'],
      anonymous: {
        credential_types_supported: [], // public — no credentials issued
      },
    },
  }

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
