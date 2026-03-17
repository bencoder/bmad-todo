import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'

describe('LoadingState', () => {
  it('has aria-busy and aria-live for assistive tech', () => {
    render(<LoadingState />)
    const el = document.querySelector('[aria-busy="true"][aria-live="polite"]')
    expect(el).toBeInTheDocument()
  })

  it('exposes "Loading tasks" for screen readers', () => {
    render(<LoadingState />)
    expect(screen.getByText('Loading tasks')).toBeInTheDocument()
  })

  it('accepts optional message prop', () => {
    render(<LoadingState message="Loading items" />)
    expect(screen.getByText('Loading items')).toBeInTheDocument()
  })
})
