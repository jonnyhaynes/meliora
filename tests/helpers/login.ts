import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = 'http://localhost:3000',
  user,
}: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  // The admin shell's navigation. This replaces the `step-nav__first` class
  // used by Payload's own template tests, which no longer exists.
  const adminShell = page.locator('.template-default .nav__wrap')
  await expect(adminShell).toBeVisible()
}
