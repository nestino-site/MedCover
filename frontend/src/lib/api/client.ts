import 'server-only'
import { type ZodType } from 'zod'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export function siteHeaders(): HeadersInit {
  return {
    'X-Site-Api-Key': getRequiredEnv('SITE_API_KEY'),
    'X-Site-Id': getRequiredEnv('SITE_ID'),
    'Content-Type': 'application/json',
  }
}

export function trafficEngineUrl(): string {
  return getRequiredEnv('TRAFFIC_ENGINE_URL')
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

function isNetworkFetchError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch failed')) return true
  const cause = error && typeof error === 'object' && 'cause' in error ? error.cause : null
  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = (cause as { code?: string }).code
    return code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'ETIMEDOUT' || code === 'ECONNREFUSED'
  }
  return false
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

  return fetch(url, {
    ...init,
    headers: {
      ...siteHeaders(),
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
  })
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
