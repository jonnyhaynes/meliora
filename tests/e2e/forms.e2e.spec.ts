import { expect, test } from '@playwright/test'

/**
 * These exercise the real endpoints, so they write real rows to whatever
 * database the server is pointed at. That is intentional — the point is to
 * prove the whole path works, not to mock it.
 */
test.describe('Forms', () => {
  test('browser validation stops an empty enquiry', async ({ page }) => {
    await page.goto('/contact')

    await page.getByRole('button', { name: /Send enquiry/i }).click()

    // Still on the contact page, and the server never saw a request.
    await expect(page).toHaveURL(/\/contact$/)
  })

  test('a valid enquiry gets through to the thank-you page', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('#name', 'Playwright Tester')
    await page.fill('#email', 'playwright@example.com')
    await page.fill('#phone', '01302 711007')
    await page.fill(
      '#message',
      'This is an automated test submission checking the enquiry form works end to end.',
    )

    await Promise.all([page.waitForURL(/\/thank-you/), page.getByRole('button', { name: /Send enquiry/i }).click()])

    await expect(page.locator('h1')).toContainText('We have got it')
  })

  test('a missing required field is reported by the server', async ({ page }) => {
    await page.goto('/book-an-appointment')

    // Fill everything except the phone number, which the server requires.
    await page.fill('#name', 'Playwright Tester')
    await page.fill('#email', 'playwright@example.com')
    await page.fill('#preferredDate', '2026-12-01')

    await page.getByRole('button', { name: /Request appointment/i }).click()

    await expect(page.getByText(/number we can reach you on/i)).toBeVisible()
  })
})
