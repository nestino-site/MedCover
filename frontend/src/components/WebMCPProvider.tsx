'use client'

import { useEffect } from 'react'

interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema?: object
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean }
  execute: (input: Record<string, unknown>) => Promise<unknown>
}

interface ModelContextNavigator extends Navigator {
  modelContext?: {
    provideContext: (context: { tools: ModelContextTool[] }, options?: { signal?: AbortSignal }) => void
  }
}

const SITE_URL = 'https://www.medcover.io'

export function WebMCPProvider() {
  useEffect(() => {
    const nav = navigator as ModelContextNavigator
    if (!nav.modelContext?.provideContext) return

    const controller = new AbortController()
    const { signal } = controller

    nav.modelContext.provideContext(
      {
        tools: [
          {
            name: 'navigate',
            title: 'Navigate to page',
            description:
              'Navigate the browser to a page on MedCover. Use this to take the user to a specific section such as treatments, clinics, cost guides, compare, or guides.',
            inputSchema: {
              type: 'object',
              required: ['path'],
              properties: {
                path: {
                  type: 'string',
                  description:
                    'Relative path to navigate to, e.g. "/treatments", "/cost", "/clinics", "/countries", "/guides", "/compare". May include a slug, e.g. "/cost/ivf/spain".',
                },
              },
            },
            annotations: { readOnlyHint: false },
            execute: async ({ path }) => {
              const url = typeof path === 'string' && path.startsWith('/')
                ? path
                : `/${String(path)}`
              window.location.href = url
              return { navigated: true, url: `${SITE_URL}${url}` }
            },
          },
          {
            name: 'get-page-content',
            title: 'Get page content',
            description:
              'Fetch the readable text content of any MedCover page as Markdown. Useful for reading treatment descriptions, country guides, clinic info, or cost breakdowns without navigating away.',
            inputSchema: {
              type: 'object',
              required: ['path'],
              properties: {
                path: {
                  type: 'string',
                  description:
                    'Relative path of the page to read, e.g. "/treatments", "/cost/ivf", "/clinics/spain", "/countries/spain".',
                },
              },
            },
            annotations: { readOnlyHint: true },
            execute: async ({ path }) => {
              const safePath = typeof path === 'string' ? path : String(path)
              const res = await fetch(`/api/md?path=${encodeURIComponent(safePath)}`)
              if (!res.ok) return { error: `Page not found: ${safePath}` }
              const markdown = await res.text()
              return { path: safePath, content: markdown }
            },
          },
          {
            name: 'list-treatments',
            title: 'List available treatments',
            description:
              'Returns the medical treatment categories available on MedCover from the live taxonomy.',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: true },
            execute: async () => {
              const res = await fetch('/api/taxonomy')
              if (!res.ok) return { treatments: [] }
              const taxonomy = await res.json()
              return {
                treatments: (taxonomy.treatments ?? []).map(
                  (t: { slug: string; name: string; clinicCount: number }) => ({
                    id: t.slug,
                    name: t.name,
                    clinicCount: t.clinicCount,
                    path: `/treatments/${t.slug}`,
                  }),
                ),
              }
            },
          },
          {
            name: 'list-destinations',
            title: 'List medical travel destinations',
            description:
              'Returns destination countries on MedCover with clinic counts from the live taxonomy.',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: true },
            execute: async () => {
              const res = await fetch('/api/taxonomy')
              if (!res.ok) return { destinations: [] }
              const taxonomy = await res.json()
              return {
                destinations: (taxonomy.countries ?? []).map(
                  (c: {
                    slug: string
                    name: string
                    flagEmoji?: string
                    clinicCount: number
                  }) => ({
                    country: c.name,
                    slug: c.slug,
                    flag: c.flagEmoji ?? '',
                    clinics: c.clinicCount,
                    path: `/clinics/${c.slug}`,
                    countryLandingPath: `/countries/${c.slug}`,
                  }),
                ),
              }
            },
          },
        ],
      },
      { signal },
    )

    return () => controller.abort()
  }, [])

  return null
}
