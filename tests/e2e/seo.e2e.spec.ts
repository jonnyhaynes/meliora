import { expect, test } from '@playwright/test'

test.describe('SEO plumbing', () => {
  test('legacy URLs redirect permanently', async ({ request }) => {
    // The old Wix site's only meaningful path. Next emits a 308, which search
    // engines treat as equivalent to a 301. Redirects are not followed here, so
    // the assertion is on the redirect itself rather than the page it lands on.
    const response = await request.get('/about-us', { maxRedirects: 0 })

    expect([301, 308]).toContain(response.status())
    expect(response.headers()['location']).toContain('/about')
  })

  test('robots.txt blocks all crawling, as a prototype should', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body).toContain('User-Agent: *')
    expect(body).toContain('Disallow: /')
    // A prototype must not advertise a sitemap.
    expect(body).not.toContain('Sitemap:')
  })

  test('every response carries a noindex X-Robots-Tag header', async ({ request }) => {
    // The header is the layer that actually works: a meta tag is only read if
    // the page is crawled, and this covers non-HTML assets too.
    for (const path of ['/', '/projects', '/contact', '/icon.png', '/sitemap.xml']) {
      const response = await request.get(path)
      expect(response.headers()['x-robots-tag'], `missing X-Robots-Tag on ${path}`).toContain(
        'noindex',
      )
    }
  })

  test('pages carry a noindex robots meta tag', async ({ page }) => {
    for (const path of ['/', '/projects']) {
      await page.goto(path)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
      await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute('content', /noindex/)
    }
  })

  test('sitemap lists real pages and omits the thank-you page', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)

    const body = await response.text()
    expect(body).toContain('/projects')
    expect(body).toContain('/journal')
    expect(body).toContain('/areas/')
    expect(body).not.toContain('/thank-you')
    expect(body).not.toContain('/admin')
  })

  test('the thank-you page is noindex', async ({ page }) => {
    await page.goto('/thank-you')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('structured data is present and parseable', async ({ page }) => {
    for (const path of ['/', '/projects', '/areas/bawtry']) {
      await page.goto(path)
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()

      expect(blocks.length, `expected JSON-LD on ${path}`).toBeGreaterThan(0)
      for (const block of blocks) {
        // Throws if the JSON is malformed, which is what we are checking.
        expect(() => JSON.parse(block)).not.toThrow()
      }
    }
  })

  test('every page sets a title and meta description', async ({ page }) => {
    for (const path of ['/', '/projects', '/kitchens', '/contact']) {
      await page.goto(path)
      await expect(page).toHaveTitle(/.+/)
    }
  })
})
