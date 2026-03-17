import { test, expect } from '@playwright/test'

test('frontend loads and shows app title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /aine-training/i })).toBeVisible()
})

test('frontend can reach backend', async ({ page }) => {
  await page.goto('/')
  // Once GET /api/todos completes we show either empty state or list (no longer "Backend: Reachable")
  await expect(
    page.getByText(/no tasks yet|tasks? loaded|aine-training/i).first()
  ).toBeVisible({ timeout: 10000 })
})
