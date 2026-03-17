import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    const description = screen.getByText('Review PRD feedback')
    expect(description).toHaveClass('line-through')
    expect(description).toHaveClass('text-gray-500')
  })

  it('shows unchecked checkbox when todo.completed is false', () => {
    render(<TaskCard todo={baseTodo} />)
    const checkbox = screen.getByRole('checkbox', { name: /not completed/i })
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).not.toBeChecked()
  })

  it('shows checked checkbox when todo.completed is true', () => {
    render(<TaskCard todo={{ ...baseTodo, completed: true }} />)
    const checkbox = screen.getByRole('checkbox', { name: /completed/i })
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

  it('checkbox is read-only', () => {
    render(<TaskCard todo={baseTodo} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('readOnly')
  })
})
