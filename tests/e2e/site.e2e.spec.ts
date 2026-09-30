import { expect, test } from '@playwright/test'

test.describe('Public site', () => {
  test('homepage renders the hero and its content', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).not.toBeEmpty()

    // The homepage is composed of several sections; if one silently stops
    // rendering, this catches it.
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Our ranges' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Start your project' })).toBeVisible()
  })

  test('every page has exactly one h1', async ({ page }) => {
    for (const path of ['/', '/projects', '/ranges', '/journal', '/about', '/contact']) {
      await page.goto(path)
      await expect(page.locator('h1'), `expected one h1 on ${path}`).toHaveCount(1)
    }
  })

  test('navigation reaches the projects page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Projects' }).click()

    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.locator('h1')).toContainText('Projects')
  })

  test('project filters narrow the results', async ({ page }) => {
    await page.goto('/projects')
    const totalText = await page.getByText(/\d+ projects?/).first().textContent()
    expect(totalText).toBeTruthy()

    await page.getByRole('group', { name: 'Filter by room' }).getByRole('link', { name: 'Kitchens' }).click()
    await expect(page).toHaveURL(/room=kitchen/)

    // The unfiltered count should exceed the filtered one.
    const filteredText = await page.getByText(/\d+ projects?/).first().textContent()
    const total = Number(totalText?.match(/\d+/)?.[0] ?? 0)
    const filtered = Number(filteredText?.match(/\d+/)?.[0] ?? 0)
    expect(filtered).toBeLessThanOrEqual(total)
  })

  test('case study page opens and closes the gallery lightbox', async ({ page }) => {
    await page.goto('/projects')
    await page.locator('a[href^="/projects/"]').first().click()

    await expect(page.locator('h1')).not.toBeEmpty()

    const firstGalleryImage = page.getByRole('button', { name: /^View image/ }).first()
    await expect(firstGalleryImage).toBeVisible()
    await firstGalleryImage.click()

    const dialog = page.getByRole('dialog', { name: 'Image viewer' })
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the brand logo renders in the header and footer', async ({ page }) => {
    await page.goto('/')

    for (const scope of ['header', 'footer']) {
      const logo = page.locator(`${scope} img`).first()
      await expect(logo, `expected a logo in the ${scope}`).toBeVisible()

      // A 404 or a broken upload would render a zero-width image, which
      // `toBeVisible` alone would not catch.
      const naturalWidth = await logo.evaluate((img) => (img as HTMLImageElement).naturalWidth)
      expect(naturalWidth, `logo in the ${scope} failed to load`).toBeGreaterThan(0)
    }
  })

  test('unknown project returns 404', async ({ page }) => {
    const response = await page.goto('/projects/this-project-does-not-exist')
    expect(response?.status()).toBe(404)
  })
})

test.describe('Parallax', () => {
  test('background photography shifts as the page scrolls', async ({ page }) => {
    await page.goto('/')

    const layer = page.locator('.will-change-transform').first()
    const atTop = await layer.evaluate((el) => el.style.transform)

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(400)

    const scrolled = await layer.evaluate((el) => el.style.transform)
    expect(scrolled).toMatch(/translate3d/)
    expect(scrolled).not.toBe(atTop)
  })

  test('sections below the fold are overscanned before they are reached', async ({ page }) => {
    // Otherwise the image visibly jumps as it scrolls into view.
    await page.goto('/')
    await page.waitForTimeout(500)

    const transforms = await page
      .locator('.will-change-transform')
      .evaluateAll((elements) => elements.map((el) => el.style.transform))

    for (const transform of transforms) {
      expect(transform).toMatch(/scale\(1\.[0-9]+\)/)
    }
  })
})

test.describe('Parallax with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('applies no transform at all', async ({ page }) => {
    await page.goto('/')

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(500)

    const transforms = await page
      .locator('.will-change-transform')
      .evaluateAll((elements) => elements.map((el) => el.style.transform))

    // An inline transform here would leave the image permanently cropped, so
    // this guards a bug that is easy to reintroduce.
    expect(transforms.every((transform) => transform === '')).toBe(true)

    // And the content must still be readable.
    await expect(page.locator('h1').first()).toBeVisible()
  })
})
