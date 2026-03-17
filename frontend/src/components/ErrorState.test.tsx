import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('shows default error message "Couldn\'t load tasks"', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    expect(screen.getByText(/couldn't load tasks/i)).toBeInTheDocument()
  })

  it('shows custom message when message prop is provided', () => {
    render(<ErrorState onRetry={vi.fn()} message="Network error" />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('shows a Retry button with visible label', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
    expect(retryButton).toHaveAttribute('type', 'button')
  })

  it('calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('Retry button is focusable', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).not.toHaveAttribute('tabIndex', '-1')
    retryButton.focus()
    expect(document.activeElement).toBe(retryButton)
  })

  it('error message region is announced to assistive tech (role=alert)', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/couldn't load tasks/i)
  })

  it('uses section semantics and consistent layout (min-height, padding)', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section).toHaveClass('min-h-[12rem]')
    expect(section).toHaveClass('p-8')
  })
})
