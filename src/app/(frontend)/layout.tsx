import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { mediaDimensions, mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { localBusinessSchema } from '@/lib/schema'

import './styles.css'

// Self-hosted through next/font, so there is no render-blocking request to
// Google and no layout shift when the fonts arrive.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const generateMetadata = async (): Promise<Metadata> => {
  const payload = await getPayloadClient()
  // depth 1 so the logo and social image come back as documents, not ids.
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const ogImage = mediaUrl(settings.ogImage)

  return {
    metadataBase: new URL(serverURL),
    title: {
      default: `${settings.businessName} | Bawtry, Doncaster`,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.tagline ?? undefined,
    openGraph: {
      // Relative URLs are resolved against metadataBase above.
      images: ogImage ? [{ height: 630, url: ogImage, width: 1200 }] : undefined,
      locale: 'en_GB',
      siteName: settings.businessName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    // Prototype: keep it out of search results so it cannot be mistaken for
    // Meliora's real website, and so the placeholder photography is not indexed
    // against the business. Reinforced by robots.txt and, most importantly, the
    // X-Robots-Tag header in next.config.ts.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayloadClient()

  const [settings, navigation] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 1 }),
    payload.findGlobal({ slug: 'navigation', depth: 0 }),
  ])

  const navItems = (navigation.header ?? []).map((item) => ({
    label: item.label,
    url: item.url,
  }))

  const logoUrl = mediaUrl(settings.logo)
  const logoDimensions = mediaDimensions(settings.logo)

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <html
      className={`${fraunces.variable} ${inter.variable}`}
      lang="en-GB"
      // The script below adds a class to this element before hydration, so the
      // server and client markup differ by design. React would otherwise warn.
      suppressHydrationWarning
    >
      <head>
        {/*
          Marks the document as JavaScript-enabled before first paint, so the
          scroll-reveal styles only hide content when something can reveal it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
        {/* Business details, for Google's knowledge panel and local results. */}
        <JsonLd data={localBusinessSchema(settings, serverURL)} />
      </head>
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-bone"
          href="#main"
        >
          Skip to content
        </a>

        <Header
          businessName={settings.businessName}
          items={navItems}
          logoHeight={logoDimensions?.height}
          logoUrl={logoUrl}
          logoWidth={logoDimensions?.width}
          phone={settings.phone}
        />

        <main id="main">{children}</main>

        <Footer navigation={navigation} settings={settings} />

        <PrototypeBanner />
      </body>
    </html>
  )
}
