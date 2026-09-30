import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('the dashboard loads once signed in', async () => {
    await page.goto('/admin')
    await expect(page.locator('.template-default .nav__wrap')).toBeVisible()
  })

  test('the menu lists the project content types', async () => {
    await page.goto('/admin')

    const nav = page.locator('.nav__wrap')
    for (const label of ['Projects', 'Enquiries', 'Photography']) {
      await expect(nav.getByText(label, { exact: false }).first()).toBeVisible()
    }
  })

  test('the projects list view opens', async () => {
    // Payload appends its own query parameters, so match on the path only.
    await page.goto('/admin/collections/projects')
    await expect(page).toHaveURL(/\/admin\/collections\/projects/)
    await expect(page.locator('table, .collection-list').first()).toBeVisible()
  })
})

/**
 * The enquiries table holds customer contact details. There is deliberately no
 * public read or write path to it, and these assertions are what keep that true
 * if somebody later loosens an access rule.
 */
test.describe('Lead capture is not publicly reachable', () => {
  test('reading enquiries without a session is refused', async ({ request }) => {
    const response = await request.get('/api/enquiries')
    expect(response.status()).toBe(403)
  })

  test('writing an enquiry through the public API is refused', async ({ request }) => {
    const response = await request.post('/api/enquiries', {
      data: { name: 'Injected', email: 'injected@example.com', message: 'should not be stored' },
    })
    expect(response.status()).toBe(403)
  })

  test('reading bookings without a session is refused', async ({ request }) => {
    const response = await request.get('/api/bookings')
    expect(response.status()).toBe(403)
  })

  test('creating a user without a session is refused', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: { email: 'sneaky@example.com', password: 'letmein123', name: 'Sneaky', role: 'admin' },
    })
    expect(response.status()).toBe(403)
  })
})
