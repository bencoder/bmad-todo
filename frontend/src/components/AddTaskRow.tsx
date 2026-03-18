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
      <form onSubmit={handleSubmit} className="flex items-center gap-add-row-gap">
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
          className="min-w-0 flex-1 rounded-input border border-border bg-surface px-[18px] py-3.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-label="Add"
          aria-busy={disabled}
          className="flex-shrink-0 rounded-button bg-primary px-[22px] py-3.5 text-body font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </form>
      {error ? (
        <p id="add-task-error" role="alert" className="text-metadata text-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
