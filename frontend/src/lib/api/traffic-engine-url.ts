/** Traffic Engine base URL (includes `/api/v1`, no trailing slash). Safe for client bundles. */
export function trafficEngineUrl(): string {
  const url = process.env.TRAFFIC_ENGINE_URL ?? process.env.API_BASE_URL
  if (!url) {
    throw new Error(
      'Missing required environment variable: TRAFFIC_ENGINE_URL (or legacy API_BASE_URL)',
    )
  }
  return url
}
