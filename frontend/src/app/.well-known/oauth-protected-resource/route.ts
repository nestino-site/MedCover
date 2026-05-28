import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// RFC 9728 — OAuth 2.0 Protected Resource Metadata
// Tells agents which authorization server can issue tokens for this resource
// and what scopes are available. Public APIs here require no token; agents
// can call them directly. The AS metadata at oauth-authorization-server
// confirms no token endpoint exists.
//
// authorization_servers must be the AS base URL — agents append
// /.well-known/oauth-authorization-server to discover the AS metadata.
export function GET() {
  const metadata = {
    resource: SITE_URL,
    resource_name: 'MedCover',
    authorization_servers: [SITE_URL],
    jwks_uri: `${SITE_URL}/.well-known/http-message-signatures-directory`,
    scopes_supported: [],
    bearer_methods_supported: [],
    resource_signing_alg_values_supported: ['ES256'],
    resource_documentation: `${SITE_URL}/.well-known/api-catalog`,
    resource_policy_uri: `${SITE_URL}/privacy`,
  }

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/oauth-protected-resource+json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
