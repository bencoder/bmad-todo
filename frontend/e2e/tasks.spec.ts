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

    // Task shows as completed: checkbox checked and description has strikethrough (description is in edit-trigger button)
    await expect(checkbox).toBeChecked()
    const descriptionButton = listItem.getByRole('button', {
      name: new RegExp(`edit task: ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
    })
    await expect(descriptionButton).toHaveClass(/line-through/)
  })
})

test.describe('editing tasks', () => {
  test('user can edit a task description and save with Enter', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E edit ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const editTrigger = listItem.getByRole('button', { name: new RegExp(`edit task: ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })
    await editTrigger.click()

    const newText = 'Updated by E2E'
    const editInput = page.getByRole('textbox', { name: /edit task description/i })
    await expect(editInput).toBeVisible({ timeout: 3000 })
    await editInput.fill(newText)

    const patchPromise = page.waitForResponse(
      (res) => res.url().includes('/api/todos/') && res.request().method() === 'PATCH' && res.status() === 200,
      { timeout: 10000 }
    )
    await editInput.press('Enter')
    await patchPromise

    await expect(page.getByText(newText)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(taskDescription)).not.toBeVisible()
  })

  test('user can cancel edit with Escape and list is unchanged', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E cancel ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const editTrigger = listItem.getByRole('button', { name: new RegExp(`edit task: ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })
    await editTrigger.click()

    const editInput = page.getByRole('textbox', { name: /edit task description/i })
    await expect(editInput).toBeVisible({ timeout: 3000 })
    await editInput.fill('This should not save')

    let patchCount = 0
    page.on('response', (res) => {
      if (res.url().includes('/api/todos/') && res.request().method() === 'PATCH') patchCount++
    })
    await editInput.press('Escape')

    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 3000 })
    expect(patchCount).toBe(0)
  })

  test('saving with empty description shows inline error and stays in edit mode', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E empty ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const editTrigger = listItem.getByRole('button', { name: new RegExp(`edit task: ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') })
    await editTrigger.click()

    const editInput = page.getByRole('textbox', { name: /edit task description/i })
    await expect(editInput).toBeVisible({ timeout: 3000 })
    await editInput.fill('   ')
    await editInput.blur()

    await expect(page.getByText(/description required/i)).toBeVisible({ timeout: 3000 })
    await expect(editInput).toBeVisible()
  })
})

test.describe('deleting tasks', () => {
  test('user can delete a task and it is removed from the list', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E delete ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const deleteBtn = listItem.getByRole('button', { name: /delete task/i })
    const deletePromise = page.waitForResponse(
      (res) => res.url().includes('/api/todos/') && res.request().method() === 'DELETE' && res.status() === 204,
      { timeout: 10000 }
    )
    await deleteBtn.click()
    await deletePromise

    // Wait for list refetch and re-render; avoid depending on which GET we catch (add vs delete refetch)
    await expect(page.getByText(taskDescription)).not.toBeVisible({ timeout: 5000 })
  })
})
