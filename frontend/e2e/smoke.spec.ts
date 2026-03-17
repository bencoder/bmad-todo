import { test, expect } from '@playwright/test'

test('frontend loads and shows content', async ({ page }) => {
  await page.goto('/')
  // After load we see one of: empty state, task list, or error (with Retry)
  await expect(
    page
      .getByText(/no tasks yet/i)
      .or(page.getByRole('list'))
      .or(page.getByRole('button', { name: /retry/i }))
      .first()
  ).toBeVisible({ timeout: 10000 })
})

test('frontend can reach backend', async ({ page }) => {
  await page.goto('/')
  // Once GET /api/todos completes we show either empty state or task list
  await expect(
    page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
  ).toBeVisible({ timeout: 10000 })
})
