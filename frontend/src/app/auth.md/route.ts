const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.medcover.io'

// auth.md — Agent registration instructions (https://github.com/workos/auth.md)
// Served as text/markdown so agents can parse registration flows.
const CONTENT = `# auth.md

You are an agent. MedCover's content APIs are **public** — no registration, no credentials, and no claim ceremony required. The full OAuth discovery chain is published so you can confirm this programmatically.

Discovery flow: discover → (no registration needed) → call API directly.

## Step 1 — Discover

### 1a. Fetch Protected Resource Metadata

\`\`\`http
GET ${SITE_URL}/.well-known/oauth-protected-resource
\`\`\`

Response shape:

\`\`\`json
{
  "resource": "${SITE_URL}",
  "resource_name": "MedCover",
  "authorization_servers": ["${SITE_URL}"],
  "scopes_supported": [],
  "bearer_methods_supported": []
}
\`\`\`

- \`resource\` — canonical URL of the API.
- \`authorization_servers\` — base URL(s) of the authorization server. Append \`/.well-known/oauth-authorization-server\` to each to fetch the AS metadata in Step 1b.
- \`scopes_supported\` / \`bearer_methods_supported\` — both empty: no token is required.

### 1b. Fetch Authorization Server Metadata

\`\`\`http
GET ${SITE_URL}/.well-known/oauth-authorization-server
\`\`\`

The response contains an \`agent_auth\` block:

\`\`\`json
{
  "agent_auth": {
    "skill": "${SITE_URL}/auth.md",
    "identity_types_supported": ["anonymous"],
    "anonymous": {
      "credential_types_supported": []
    }
  }
}
\`\`\`

\`identity_types_supported\` is \`["anonymous"]\` — agents may call APIs without any credentials. No \`register_uri\`, \`claim_uri\`, or \`revocation_uri\` exists because no credentials are issued. Skip to Step 3.

## Step 2 — Pick a method

No registration method is required. MedCover's public APIs do not require authentication.

If you are calling the webhook endpoint (\`POST /api/webhooks/publish\`), that endpoint uses **HMAC signatures** (\`x-publish-signature\` header), not OAuth. Contact the operator for a shared secret.

If you are acting as a bot making outbound requests signed per RFC 9421, the public verification key is at:

\`\`\`
${SITE_URL}/.well-known/http-message-signatures-directory
\`\`\`

## Step 3 — Use the API

Call public endpoints directly — no \`Authorization\` header needed:

\`\`\`http
GET /api/content/hero-image
Accept: application/json
\`\`\`

Full API catalogue: \`${SITE_URL}/.well-known/api-catalog\`

Agent index: \`${SITE_URL}/.well-known/agents\`

A2A agent card: \`${SITE_URL}/.well-known/a2a\`

## Errors

| Code | Endpoint | What to do |
|------|----------|------------|
| 401  | \`/api/webhooks/publish\` | Missing or invalid HMAC signature — not an OAuth issue. |
| 429  | any | Back off and retry with exponential backoff. |
| 5xx  | any | Retry with exponential backoff. |

## Revocation

Not applicable — no agent credentials are issued by this service.
`

export function GET() {
  return new Response(CONTENT, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Link': `<${SITE_URL}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
    },
  })
}
