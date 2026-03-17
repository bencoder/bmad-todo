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
})
