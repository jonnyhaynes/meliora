import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'

const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** Pages that exist as static routes and are worth indexing. */
const staticRoutes: { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; path: string; priority: number }[] = [
  { changeFrequency: 'weekly', path: '/', priority: 1 },
  { changeFrequency: 'monthly', path: '/kitchens', priority: 0.9 },
  { changeFrequency: 'monthly', path: '/bedrooms', priority: 0.9 },
  { changeFrequency: 'monthly', path: '/bathrooms', priority: 0.9 },
  { changeFrequency: 'monthly', path: '/design', priority: 0.7 },
  { changeFrequency: 'weekly', path: '/projects', priority: 0.9 },
  { changeFrequency: 'monthly', path: '/ranges', priority: 0.8 },
  { changeFrequency: 'weekly', path: '/journal', priority: 0.7 },
  { changeFrequency: 'monthly', path: '/about', priority: 0.6 },
  { changeFrequency: 'monthly', path: '/showroom', priority: 0.7 },
  { changeFrequency: 'yearly', path: '/areas', priority: 0.6 },
  { changeFrequency: 'yearly', path: '/contact', priority: 0.6 },
  { changeFrequency: 'yearly', path: '/book-an-appointment', priority: 0.7 },
]

/**
 * Generated from live content, so a new project or journal post appears in the
 * sitemap without anyone remembering to update a file. /thank-you is deliberately
 * absent.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()

  const [projects, ranges, posts, areas, services, pages] = await Promise.all([
    payload.find({ collection: 'projects', depth: 0, limit: 500, sort: '-publishedAt' }),
    payload.find({ collection: 'ranges', depth: 0, limit: 200 }),
    payload.find({ collection: 'posts', depth: 0, limit: 500, sort: '-publishedAt' }),
    payload.find({ collection: 'service-areas', depth: 0, limit: 200 }),
    payload.find({ collection: 'services', depth: 0, limit: 50 }),
    payload.find({ collection: 'pages', depth: 0, limit: 100 }),
  ])

  const now = new Date()

  return [
    ...staticRoutes.map((route) => ({
      changeFrequency: route.changeFrequency,
      lastModified: now,
      priority: route.priority,
      url: `${siteURL}${route.path}`,
    })),
    ...projects.docs.map((doc) => ({
      changeFrequency: 'monthly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.8,
      url: `${siteURL}/projects/${doc.slug}`,
    })),
    ...ranges.docs.map((doc) => ({
      changeFrequency: 'monthly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.7,
      url: `${siteURL}/ranges/${doc.slug}`,
    })),
    ...posts.docs.map((doc) => ({
      changeFrequency: 'yearly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.6,
      url: `${siteURL}/journal/${doc.slug}`,
    })),
    ...areas.docs.map((doc) => ({
      changeFrequency: 'yearly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.6,
      url: `${siteURL}/areas/${doc.slug}`,
    })),
    // Services and pages have their own top-level URLs, so no prefix here.
    ...services.docs.map((doc) => ({
      changeFrequency: 'monthly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.8,
      url: `${siteURL}/${doc.slug}`,
    })),
    ...pages.docs.map((doc) => ({
      changeFrequency: 'monthly' as const,
      lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
      priority: 0.6,
      url: `${siteURL}/${doc.slug}`,
    })),
  ]
}
