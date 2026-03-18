import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddTaskRow } from './AddTaskRow'

describe('AddTaskRow', () => {
  it('renders input with placeholder "Add a task"', () => {
    render(<AddTaskRow />)
    const input = screen.getByPlaceholderText('Add a task')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders Add button', () => {
    render(<AddTaskRow />)
    const button = screen.getByRole('button', { name: /add/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Add')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('has accessible label or aria-label for input', () => {
    render(<AddTaskRow />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    expect(input).toBeInTheDocument()
  })

  it('uses form with label and submit button for semantics', () => {
    render(<AddTaskRow />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const form = input.closest('form')
    expect(form).toBeInTheDocument()
    expect(screen.getByLabelText(/add a task/i)).toBeInTheDocument()
    const submitBtn = screen.getByRole('button', { name: /add/i })
    expect(submitBtn).toHaveAttribute('type', 'submit')
  })

  it('add input and Add button are focusable by keyboard', () => {
    render(<AddTaskRow />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const button = screen.getByRole('button', { name: /add/i })
    expect(input).not.toHaveAttribute('tabIndex', '-1')
    expect(button).not.toHaveAttribute('tabIndex', '-1')
    input.focus()
    expect(document.activeElement).toBe(input)
    button.focus()
    expect(document.activeElement).toBe(button)
  })

  it('submit does not throw when form is submitted', () => {
    render(<AddTaskRow />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const form = input.closest('form')
    expect(form).not.toBeNull()
    expect(() => fireEvent.submit(form!)).not.toThrow()
  })

  it('calls optional onSubmit when provided with trimmed input value', () => {
    const onSubmit = vi.fn()
    render(<AddTaskRow onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const form = input.closest('form')
    expect(form).not.toBeNull()
    fireEvent.change(input, { target: { value: '  New task  ' } })
    fireEvent.submit(form!)
    expect(onSubmit).toHaveBeenCalledWith('New task')
  })

  it('shows inline error when error prop is set', () => {
    render(<AddTaskRow error="Couldn't add task" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("Couldn't add task")
  })

  it('clears input when clearInputRef is called after mount', () => {
    const clearInputRef = { current: null as (() => void) | null }
    render(<AddTaskRow clearInputRef={clearInputRef} />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    fireEvent.change(input, { target: { value: 'Something' } })
    expect(input).toHaveValue('Something')
    clearInputRef.current?.()
    expect(input).toHaveValue('')
  })

  it('disables input and button when disabled prop is true', () => {
    render(<AddTaskRow disabled />)
    const input = screen.getByRole('textbox', { name: /add a task/i })
    const button = screen.getByRole('button', { name: /add/i })
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })
})
