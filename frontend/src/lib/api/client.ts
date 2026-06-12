import 'server-only'
import { type ZodType } from 'zod'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

/** Traffic Engine base URL (includes `/api/v1`, no trailing slash). */
export function trafficEngineUrl(): string {
  const url = process.env.TRAFFIC_ENGINE_URL ?? process.env.API_BASE_URL
  if (!url) {
    throw new Error(
      'Missing required environment variable: TRAFFIC_ENGINE_URL (or legacy API_BASE_URL)',
    )
  }
  return url
}

export function siteHeaders(): HeadersInit {
  return {
    'X-Site-Api-Key': getRequiredEnv('SITE_API_KEY'),
    'X-Site-Id': getRequiredEnv('SITE_ID'),
    'Content-Type': 'application/json',
  }
}

export function revalidateSeconds(): number {
  return Number(process.env.CONTENT_REVALIDATE_SECONDS ?? 3600)
}

/** Default 60s in dev (slow VPN/Railway cold start); 30s in production. */
export function trafficEngineFetchTimeoutMs(): number {
  const fromEnv = Number(process.env.TRAFFIC_ENGINE_FETCH_TIMEOUT_MS)
  if (!Number.isNaN(fromEnv) && fromEnv > 0) return fromEnv
  return process.env.NODE_ENV === 'development' ? 60_000 : 30_000
}

const TRANSIENT_NETWORK_ERROR_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ECONNRESET',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
])

function isNetworkFetchError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase()
    if (message.includes('fetch failed') || message === 'terminated') return true
  }
  const cause = error && typeof error === 'object' && 'cause' in error ? error.cause : null
  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = (cause as { code?: string }).code
    if (code && TRANSIENT_NETWORK_ERROR_CODES.has(code)) return true
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Retries on transient network errors (default 3 retries in production). */
export function trafficEngineFetchRetries(): number {
  const fromEnv = Number(process.env.TRAFFIC_ENGINE_FETCH_RETRIES)
  if (!Number.isNaN(fromEnv) && fromEnv >= 0) return fromEnv
  return 3
}

export function isTrafficEngineUnreachable(error: unknown): boolean {
  if (isNetworkFetchError(error)) return true
  if (error instanceof Error && error.cause !== undefined) {
    return isTrafficEngineUnreachable(error.cause)
  }
  return false
}

/** Fetch against Traffic Engine with site headers and a connect/read timeout. */
export async function trafficEngineFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const baseUrl = trafficEngineUrl()
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`
  const timeoutMs = trafficEngineFetchTimeoutMs()
  const maxAttempts = trafficEngineFetchRetries() + 1
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fetch(url, {
        ...init,
        headers: {
          ...siteHeaders(),
          ...init?.headers,
        },
        signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === maxAttempts - 1
      if (isLastAttempt || !isNetworkFetchError(error)) {
        throw error
      }
      await sleep(500 * 2 ** attempt)
    }
  }

  throw lastError
}

export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  fetchOptions?: RequestInit,
): Promise<T> {
  const url = path.startsWith('http') ? path : `${trafficEngineUrl()}${path}`

  try {
    const res = await trafficEngineFetch(path, fetchOptions)

    if (!res.ok) {
      throw new Error(`Traffic Engine API failed: ${res.status} ${res.statusText} — ${url}`)
    }

    const json = await res.json()
    return schema.parse(json)
  } catch (error) {
    if (isNetworkFetchError(error)) {
      throw new Error(
        `Traffic Engine unreachable (${trafficEngineUrl()}). Check TRAFFIC_ENGINE_URL or increase TRAFFIC_ENGINE_FETCH_TIMEOUT_MS.`,
        { cause: error },
      )
    }
    throw error
  }
}
