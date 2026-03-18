import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('shows "No tasks yet" message', () => {
    render(<EmptyState />)
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('uses section semantics and accessible name for the empty state', () => {
    render(<EmptyState />)
    const section = screen.getByRole('region', { name: 'No tasks' })
    expect(section).toBeInTheDocument()
  })

})
