import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// OpenID Connect Discovery 1.0 — https://openid.net/specs/openid-connect-discovery-1_0.html
// Minimal document: no OIDC provider here, but issuer + jwks_uri satisfies agent discovery.
export function GET() {
  const configuration = {
    issuer: SITE_URL,
    jwks_uri: `${SITE_URL}/.well-known/http-message-signatures-directory`,
    // No authorization/token/userinfo endpoints — this is not an identity provider
    authorization_endpoint: null,
    token_endpoint: null,
    userinfo_endpoint: null,
    grant_types_supported: [],
    response_types_supported: [],
    subject_types_supported: [],
    id_token_signing_alg_values_supported: ['ES256'],
    scopes_supported: [],
    claims_supported: [],
    service_documentation: `${SITE_URL}/.well-known/api-catalog`,
  }

  return NextResponse.json(configuration, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
