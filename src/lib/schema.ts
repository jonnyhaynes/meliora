import type { SiteSetting } from '@/payload-types'

type Address = SiteSetting['address']

/**
 * Structured data for the business itself. This is what feeds the Google
 * knowledge panel and local pack — the address, phone and opening hours here
 * should always come from site settings so they cannot drift from the page.
 */
export const localBusinessSchema = (settings: SiteSetting, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
    addressLocality: settings.address?.town ?? undefined,
    addressRegion: settings.address?.county ?? undefined,
    postalCode: settings.address?.postcode ?? undefined,
    streetAddress: settings.address?.street ?? undefined,
  },
  email: settings.email,
  name: settings.businessName,
  openingHours: (settings.openingHours ?? [])
    .map((row) => `${row.days} ${row.hours}`)
    .join('; '),
  priceRange: '£££',
  sameAs: [settings.socials?.instagram, settings.socials?.facebook, settings.mapUrl].filter(
    Boolean,
  ),
  telephone: settings.phone,
  url,
})

type BreadcrumbItem = {
  name: string
  url: string
}

export const breadcrumbSchema = (items: BreadcrumbItem[], siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    item: `${siteUrl}${item.url}`,
    name: item.name,
    position: index + 1,
  })),
})

export const blogPostingSchema = (post: {
  title: string
  description: string
  url: string
  image?: string | null
  datePublished?: string | null
  authorName: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  author: { '@type': 'Organization', name: post.authorName },
  datePublished: post.datePublished ?? undefined,
  description: post.description,
  headline: post.title,
  image: post.image ?? undefined,
  mainEntityOfPage: { '@id': post.url, '@type': 'WebPage' },
  publisher: { '@type': 'Organization', name: post.authorName },
})

export const serviceSchema = (service: {
  name: string
  description: string
  url: string
  areaServed: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  areaServed: service.areaServed,
  description: service.description,
  name: service.name,
  provider: { '@type': 'HomeAndConstructionBusiness', name: 'Meliora' },
  url: service.url,
})

export type { Address }
