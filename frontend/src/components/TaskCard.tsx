import { useRef, useEffect } from 'react'
import type { Todo } from '../types/todo'

/** Format ISO 8601 createdAt for display (locale-aware medium date). Returns fallback if missing or invalid. */
function formatCreatedAt(createdAt: string): string {
  if (!createdAt || isNaN(new Date(createdAt).getTime())) return '—'
  return new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

const inputClassName =
  'flex-1 min-w-0 rounded-input border border-border bg-surface px-[18px] py-3.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2'

export interface TaskCardProps {
  todo: Todo
  onToggleComplete?: (id: number, completed: boolean) => void
  onDelete?: (id: number) => void
  /** When true, show inline input instead of label. */
  isEditing?: boolean
  onStartEdit?: (id: number) => void
  onSaveEdit?: (id: number, description: string) => void
  onCancelEdit?: (id: number) => void
  /** Inline error when save failed or validation (e.g. empty description). */
  editError?: string
}

export function TaskCard({
  todo,
  onToggleComplete,
  onDelete,
  isEditing = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  editError,
}: TaskCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleChange = () => {
    onToggleComplete?.(todo.id, !todo.completed)
  }

  const handleSave = () => {
    const raw = inputRef.current?.value?.trim() ?? ''
    onSaveEdit?.(todo.id, raw)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancelEdit?.(todo.id)
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3.5">
      <input
        type="checkbox"
        checked={Boolean(todo.completed)}
        readOnly={!onToggleComplete}
        aria-label={todo.completed ? 'Mark task active' : 'Mark task complete'}
        className="h-[22px] w-[22px] flex-shrink-0 rounded-[6px] border-2 border-[text-primary] accent-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        onChange={onToggleComplete ? handleChange : undefined}
      />
      {isEditing ? (
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <input
            ref={inputRef}
            type="text"
            defaultValue={todo.description ?? ''}
            aria-label="Edit task description"
            aria-invalid={editError ? 'true' : undefined}
            aria-describedby={editError ? `task-edit-error-${todo.id}` : undefined}
            className={inputClassName}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
          {editError ? (
            <p id={`task-edit-error-${todo.id}`} role="alert" className="text-metadata text-error">
              {editError}
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onStartEdit?.(todo.id)}
          aria-label={`Edit task: ${todo.description ?? ''}`}
          className={`flex-1 text-left text-body outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-input ${todo.completed ? 'font-medium text-text-muted line-through' : 'text-text-primary'}`}
        >
          {todo.description ?? ''}
        </button>
      )}
      <time dateTime={todo.createdAt ?? ''} className="text-metadata text-text-secondary flex-shrink-0">
        {formatCreatedAt(todo.createdAt ?? '')}
      </time>
      {onDelete && (
        <button
          type="button"
          aria-label="Delete task"
          className="min-h-[44px] min-w-[44px] flex-shrink-0 rounded-button border border-border bg-transparent px-2 text-text-muted hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          onClick={() => onDelete(todo.id)}
        >
          Delete
        </button>
      )}
    </li>
  )
}
