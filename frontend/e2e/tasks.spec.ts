import { test, expect } from '@playwright/test'

test.describe('adding tasks', () => {
  test('user can add a task and see it in the list', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E task ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()

    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('list')).toContainText(taskDescription)
  })

  test('user can add a task with Enter key', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E Enter ${Date.now()}`
    const input = page.getByRole('textbox', { name: /add a task/i })
    await input.fill(taskDescription)
    await input.press('Enter')

    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('marking tasks complete', () => {
  test('user can mark a task complete via checkbox and see strikethrough', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E complete ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const checkbox = listItem.getByRole('checkbox')

    const isListGet = (res: { url: () => string; request: () => { method: () => string }; status: () => number }) => {
      const u = res.url()
      return (u.endsWith('/api/todos') || u.includes('/api/todos?')) && res.request().method() === 'GET' && res.status() === 200
    }
    const patchPromise = page.waitForResponse(
      (res) => res.url().includes('/api/todos/') && res.request().method() === 'PATCH' && res.status() === 200,
      { timeout: 10000 }
    )
    const getAfterPatchPromise = page.waitForResponse(isListGet, { timeout: 10000 })
    await checkbox.click()
    await patchPromise
    await getAfterPatchPromise

    // Task shows as completed: checkbox checked and description has strikethrough
    await expect(checkbox).toBeChecked()
    await expect(listItem.locator('span')).toHaveClass(/line-through/)
  })
})
