import { NextResponse } from 'next/server'

// Public key for Web Bot Auth (RFC draft-ietf-httpbis-web-bot-auth)
// Allows receiving sites to verify HTTP Message Signatures (RFC 9421) on
// requests sent by this site when acting as a bot or agent.
// The private key is stored in WEB_BOT_AUTH_PRIVATE_KEY env var for signing.
const JWKS = {
  keys: [
    {
      kty: 'EC',
      crv: 'P-256',
      use: 'sig',
      alg: 'ES256',
      kid: 'medcover-bot-key-1',
      x: 'A_QSji--Ako7h8Q2oNAZccPVAthzMTDsaOXIAzHyFgk',
      y: '6RaC1rW07GRdubDok3upwHAdbFTuZo2O4EV9ol2PEE4',
    },
  ],
}

export function GET() {
  return NextResponse.json(JWKS, {
    headers: {
      'Content-Type': 'application/jwk-set+json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
