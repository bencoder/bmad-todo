import type { Todo } from '../types/todo'

/** Format ISO 8601 createdAt for display (locale-aware medium date). Returns fallback if missing or invalid. */
function formatCreatedAt(createdAt: string): string {
  if (!createdAt || isNaN(new Date(createdAt).getTime())) return '—'
  return new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export interface TaskCardProps {
  todo: Todo
  onToggleComplete?: (id: number, completed: boolean) => void
}

export function TaskCard({ todo, onToggleComplete }: TaskCardProps) {
  const handleChange = () => {
    onToggleComplete?.(todo.id, !todo.completed)
  }
  return (
    <li className="flex items-center gap-3 rounded-lg border border-[#eee] bg-[#fafafa] px-4 py-3.5">
      <input
        type="checkbox"
        checked={Boolean(todo.completed)}
        readOnly={!onToggleComplete}
        aria-label={todo.completed ? 'Mark task active' : 'Mark task complete'}
        className="h-5 w-5 flex-shrink-0 rounded border-2 border-gray-700"
        onChange={onToggleComplete ? handleChange : undefined}
      />
      <span
        className={`flex-1 text-base ${todo.completed ? 'font-medium text-gray-500 line-through' : 'text-gray-900'}`}
      >
        {todo.description ?? ''}
      </span>
      <time
        dateTime={todo.createdAt ?? ''}
        className="text-sm text-gray-500"
      >
        {formatCreatedAt(todo.createdAt ?? '')}
      </time>
    </li>
  )
}
