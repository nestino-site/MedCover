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
              'Navigate the browser to a page on MedCover. Use this to take the user to a specific section such as treatments, destinations, cost guides, or clinics.',
            inputSchema: {
              type: 'object',
              required: ['path'],
              properties: {
                path: {
                  type: 'string',
                  description:
                    'Relative path to navigate to, e.g. "/treatments", "/costs", "/countries", "/guides", "/cities". May include a slug, e.g. "/costs/ivf".',
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
                    'Relative path of the page to read, e.g. "/treatments", "/costs/ivf", "/countries/spain".',
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
              'Returns the medical treatment categories available on MedCover along with their status.',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: true },
            execute: async () => ({
              treatments: [
                { id: 'ivf', name: 'IVF & Fertility', status: 'active', path: '/treatments/ivf' },
                { id: 'dental', name: 'Dental', status: 'coming_soon' },
                { id: 'hair', name: 'Hair Transplant', status: 'coming_soon' },
                { id: 'cosmetic', name: 'Cosmetic Surgery', status: 'coming_soon' },
              ],
            }),
          },
          {
            name: 'list-destinations',
            title: 'List IVF destinations',
            description:
              'Returns the available medical tourism destination countries on MedCover, with indicative costs and clinic counts for IVF treatment.',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: true },
            execute: async () => ({
              destinations: [
                { country: 'Spain', slug: 'spain', flag: '🇪🇸', ivfFrom: '€3,200', clinics: 12, path: '/countries/spain' },
                { country: 'Greece', slug: 'greece', flag: '🇬🇷', ivfFrom: '€2,800', clinics: 8, path: '/countries/greece' },
                { country: 'Czech Republic', slug: 'czech-republic', flag: '🇨🇿', ivfFrom: '€2,400', clinics: 4, path: '/countries/czech-republic' },
                { country: 'Turkey', slug: 'turkey', flag: '🇹🇷', ivfFrom: '€2,600', clinics: 6, path: '/countries/turkey' },
                { country: 'Portugal', slug: 'portugal', flag: '🇵🇹', ivfFrom: '€3,000', clinics: 5, path: '/countries/portugal' },
                { country: 'North Macedonia', slug: 'north-macedonia', flag: '🇲🇰', ivfFrom: '€2,200', clinics: 3, path: '/countries/north-macedonia' },
              ],
            }),
          },
        ],
      },
      { signal },
    )

    return () => controller.abort()
  }, [])

  return null
}
