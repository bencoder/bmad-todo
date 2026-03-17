import { useRef, useEffect, useCallback } from 'react'

/**
 * AddTaskRow: text input + primary "Add" button at top of list.
 * Presentational in Story 2.2; submit wired to API in Epic 3 Story 3.2 (Direction C, UX-DR2).
 */
export interface AddTaskRowProps {
  /** Optional submit handler; no-op in this story. */
  onSubmit?: (value: string) => void
  /** Optional ref parent can call after successful add to clear the input. */
  clearInputRef?: React.MutableRefObject<(() => void) | null>
  /** Optional inline error message (e.g. from create mutation failure). */
  error?: string
  /** Optional: disable input and button while mutation is pending. */
  disabled?: boolean
}

export function AddTaskRow({ onSubmit, clearInputRef, error, disabled }: AddTaskRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const clearInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  useEffect(() => {
    if (clearInputRef) clearInputRef.current = clearInput
    return () => {
      if (clearInputRef) clearInputRef.current = null
    }
  }, [clearInputRef, clearInput])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value?.trim() ?? ''
    onSubmit?.(value)
  }

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <label htmlFor="add-task-input" className="sr-only">
          Add a task
        </label>
        <input
          ref={inputRef}
          id="add-task-input"
          type="text"
          placeholder="Add a task"
          aria-label="Add a task"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'add-task-error' : undefined}
          disabled={disabled}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-label="Add"
          aria-busy={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>
      {error ? (
        <p id="add-task-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
