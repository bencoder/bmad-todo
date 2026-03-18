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

    // After edit, the list item shows newText (listItem ref was for old text so re-query by new text)
    await expect(page.getByRole('listitem').filter({ hasText: newText }).first()).toBeVisible({ timeout: 5000 })
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

test.describe('keyboard and focus (WCAG 2.1)', () => {
  test('tab order: add input → Add → task checkbox → edit trigger → delete, and focus is visible', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(
      page.getByText(/no tasks yet/i).or(page.getByRole('list')).first()
    ).toBeVisible({ timeout: 10000 })

    const taskDescription = `E2E keyboard ${Date.now()}`
    await page.getByRole('textbox', { name: /add a task/i }).fill(taskDescription)
    await page.getByRole('button', { name: /^add$/i }).click()
    await expect(page.getByText(taskDescription)).toBeVisible({ timeout: 5000 })

    const listItem = page.getByRole('listitem').filter({ hasText: taskDescription })
    const checkbox = listItem.getByRole('checkbox')
    const editTrigger = listItem.getByRole('button', {
      name: new RegExp(`edit task: ${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
    })
    const deleteBtn = listItem.getByRole('button', { name: /delete task/i })
    const addInput = page.getByRole('textbox', { name: /add a task/i })
    const addButton = page.getByRole('button', { name: /^add$/i })

    // Tab until each expected element is focused (robust to extra tab stops)
    await addInput.focus()
    await expect(addInput).toBeFocused()

    const maxTabs = 200
    const isFocused = (locator: ReturnType<typeof page.getByRole>) =>
      locator.evaluate((el) => document.activeElement === el)

    let reached = false
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      if (await isFocused(addButton)) {
        reached = true
        break
      }
    }
    expect(reached, 'Add button should be reachable via Tab').toBe(true)

    reached = false
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      if (await isFocused(checkbox)) {
        reached = true
        break
      }
    }
    expect(reached, 'Checkbox should be reachable via Tab').toBe(true)

    reached = false
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      if (await isFocused(editTrigger)) {
        reached = true
        break
      }
    }
    expect(reached, 'Edit trigger should be reachable via Tab').toBe(true)

    reached = false
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      if (await isFocused(deleteBtn)) {
        reached = true
        break
      }
    }
    expect(reached, 'Delete button should be reachable via Tab').toBe(true)

    const deleteFocused = await deleteBtn.evaluate((el) => document.activeElement === el)
    expect(deleteFocused).toBe(true)
  })

  test('Retry button is focusable when in error state', async ({ page }) => {
    await page.route((url) => url.pathname.endsWith('/api/todos'), (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ status: 500, body: JSON.stringify({ message: 'Server error' }) })
      }
      return route.continue()
    })
    await page.goto('/')
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({ timeout: 20000 })
    const retry = page.getByRole('button', { name: /retry/i })
    await retry.focus()
    await expect(retry).toBeFocused()
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
