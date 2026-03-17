import { useRef } from 'react'

/**
 * AddTaskRow: text input + primary "Add" button at top of list.
 * Presentational in Story 2.2; submit wired to API in Epic 3 Story 3.2 (Direction C, UX-DR2).
 */
export interface AddTaskRowProps {
  /** Optional submit handler; no-op in this story. */
  onSubmit?: (value: string) => void
}

export function AddTaskRow({ onSubmit }: AddTaskRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = inputRef.current?.value?.trim() ?? ''
    onSubmit?.(value)
  }

  return (
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
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        aria-label="Add"
      >
        Add
      </button>
    </form>
  )
}
