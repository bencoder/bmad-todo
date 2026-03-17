import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows "No tasks yet" message', () => {
    render(<EmptyState />)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('shows a focusable add affordance with accessible name', () => {
    render(<EmptyState />)
    const addControl = screen.getByRole('button', { name: /add your first task/i })
    expect(addControl).toBeInTheDocument()
    expect(addControl).toHaveAttribute('type', 'button')
  })

  it('uses section semantics and accessible name for the empty state', () => {
    render(<EmptyState />)
    const section = screen.getByRole('region', { name: 'No tasks' })
    expect(section).toBeInTheDocument()
  })

  it('add affordance is focusable', () => {
    render(<EmptyState />)
    const addControl = screen.getByRole('button', { name: /add your first task/i })
    expect(addControl).not.toHaveAttribute('tabIndex', '-1')
    addControl.focus()
    expect(document.activeElement).toBe(addControl)
  })
})
