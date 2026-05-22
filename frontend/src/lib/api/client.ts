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

export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  fetchOptions?: RequestInit,
): Promise<T> {
  const baseUrl = trafficEngineUrl()
  const url = `${baseUrl}${path}`

  const res = await fetch(url, {
    headers: siteHeaders(),
    ...fetchOptions,
  })

  if (!res.ok) {
    throw new Error(`Traffic Engine API failed: ${res.status} ${res.statusText} — ${url}`)
  }

  const json = await res.json()
  return schema.parse(json)
}
