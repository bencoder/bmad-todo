import { test, expect } from '@playwright/test'

test('frontend loads and shows app title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /aine-training/i })).toBeVisible()
})

test('frontend can reach backend', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Reachable')).toBeVisible({ timeout: 10000 })
})
