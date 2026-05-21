import 'server-only'
import { type ZodType } from 'zod'

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
): Promise<T> {
  const baseUrl = getRequiredEnv('API_BASE_URL')
  const apiKey = getRequiredEnv('SITE_API_KEY')
  const siteId = getRequiredEnv('SITE_ID')

  const url = `${baseUrl}${path}`

  const res = await fetch(url, {
    headers: {
      'X-Site-Api-Key': apiKey,
      'X-Site-Id': siteId,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText} — ${url}`)
  }

  const json = await res.json()
  return schema.parse(json)
}
