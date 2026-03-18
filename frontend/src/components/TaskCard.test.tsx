import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import type { Todo } from '../types/todo'

const baseTodo: Todo = {
  id: 1,
  description: 'Review PRD feedback',
  completed: false,
  createdAt: '2026-03-17T12:00:00.000Z',
}

describe('TaskCard', () => {
  it('renders description and creation time', () => {
    render(<TaskCard todo={baseTodo} />)
    expect(screen.getByText('Review PRD feedback')).toBeInTheDocument()
    expect(screen.getByRole('time')).toHaveAttribute('dateTime', '2026-03-17T12:00:00.000Z')
    const timeText = screen.getByRole('time').textContent ?? ''
    expect(timeText).toMatch(/2026/)
    expect(timeText).toMatch(/17/)
  })

  it('shows completed state with strikethrough and muted color when todo.completed is true', () => {
    render(<TaskCard todo={{ ...baseTodo, completed: true }} />)
    const description = screen.getByRole('button', { name: /edit task: review prd feedback/i })
    expect(description).toHaveClass('line-through')
    expect(description).toHaveClass('text-gray-500')
  })

  it('shows unchecked checkbox when todo.completed is false', () => {
    render(<TaskCard todo={baseTodo} />)
    const checkbox = screen.getByRole('checkbox', { name: /mark task complete/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('shows checked checkbox when todo.completed is true', () => {
    render(<TaskCard todo={{ ...baseTodo, completed: true }} />)
    const checkbox = screen.getByRole('checkbox', { name: /mark task active/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toBeChecked()
  })

  it('uses card layout with Direction C classes (padding, rounded, border)', () => {
    const { container } = render(<TaskCard todo={baseTodo} />)
    const card = container.querySelector('li')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('border-[#eee]')
    expect(card).toHaveClass('bg-[#fafafa]')
    expect(card).toHaveClass('px-4')
    expect(card).toHaveClass('py-3.5')
  })

  it('checkbox is read-only when onToggleComplete is not provided', () => {
    render(<TaskCard todo={baseTodo} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('readOnly')
  })

  it('calls onToggleComplete with id and toggled completed when checkbox is changed', () => {
    const onToggleComplete = vi.fn()
    render(<TaskCard todo={baseTodo} onToggleComplete={onToggleComplete} />)
    const checkbox = screen.getByRole('checkbox', { name: /mark task complete/i })
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(onToggleComplete).toHaveBeenCalledTimes(1)
    expect(onToggleComplete).toHaveBeenCalledWith(1, true)
  })

  it('calls onToggleComplete with completed false when unchecking completed task', () => {
    const onToggleComplete = vi.fn()
    render(<TaskCard todo={{ ...baseTodo, completed: true }} onToggleComplete={onToggleComplete} />)
    const checkbox = screen.getByRole('checkbox', { name: /mark task active/i })
    fireEvent.click(checkbox)
    expect(onToggleComplete).toHaveBeenCalledWith(1, false)
  })

  it('checkbox is not read-only when onToggleComplete is provided', () => {
    render(<TaskCard todo={baseTodo} onToggleComplete={() => {}} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toHaveAttribute('readOnly')
  })

  it('does not show delete button when onDelete is not provided', () => {
    render(<TaskCard todo={baseTodo} />)
    expect(screen.queryByRole('button', { name: /delete task/i })).not.toBeInTheDocument()
  })

  it('shows delete button with aria-label "Delete task" when onDelete is provided', () => {
    render(<TaskCard todo={baseTodo} onDelete={() => {}} />)
    const btn = screen.getByRole('button', { name: /delete task/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-label', 'Delete task')
  })

  it('calls onDelete with todo.id when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<TaskCard todo={baseTodo} onDelete={onDelete} />)
    const btn = screen.getByRole('button', { name: /delete task/i })
    fireEvent.click(btn)
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  describe('inline edit', () => {
    it('when not editing shows focusable label that calls onStartEdit on click', () => {
      const onStartEdit = vi.fn()
      render(<TaskCard todo={baseTodo} onStartEdit={onStartEdit} />)
      const editTrigger = screen.getByRole('button', { name: /edit task: review prd feedback/i })
      expect(editTrigger).toBeInTheDocument()
      fireEvent.click(editTrigger)
      expect(onStartEdit).toHaveBeenCalledTimes(1)
      expect(onStartEdit).toHaveBeenCalledWith(1)
    })

    it('when isEditing is true renders input with current description', () => {
      render(<TaskCard todo={baseTodo} isEditing />)
      const input = screen.getByRole('textbox', { name: /edit task description/i })
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Review PRD feedback')
    })

    it('when editing, Enter calls onSaveEdit with id and trimmed text', () => {
      const onSaveEdit = vi.fn()
      render(<TaskCard todo={baseTodo} isEditing onSaveEdit={onSaveEdit} />)
      const input = screen.getByRole('textbox', { name: /edit task description/i })
      fireEvent.change(input, { target: { value: '  new text  ' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onSaveEdit).toHaveBeenCalledTimes(1)
      expect(onSaveEdit).toHaveBeenCalledWith(1, 'new text')
    })

    it('when editing, blur calls onSaveEdit with id and trimmed text', async () => {
      const onSaveEdit = vi.fn()
      render(<TaskCard todo={baseTodo} isEditing onSaveEdit={onSaveEdit} />)
      const input = screen.getByRole('textbox', { name: /edit task description/i })
      fireEvent.change(input, { target: { value: '  saved on blur  ' } })
      fireEvent.blur(input)
      await waitFor(() => {
        expect(onSaveEdit).toHaveBeenCalledWith(1, 'saved on blur')
      })
    })

    it('when editing, Escape calls onCancelEdit with id', () => {
      const onCancelEdit = vi.fn()
      render(<TaskCard todo={baseTodo} isEditing onCancelEdit={onCancelEdit} />)
      const input = screen.getByRole('textbox', { name: /edit task description/i })
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(onCancelEdit).toHaveBeenCalledTimes(1)
      expect(onCancelEdit).toHaveBeenCalledWith(1)
    })

    it('when editing and editError provided, shows inline error', () => {
      render(<TaskCard todo={baseTodo} isEditing editError="Description required" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Description required')
      const input = screen.getByRole('textbox', { name: /edit task description/i })
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
