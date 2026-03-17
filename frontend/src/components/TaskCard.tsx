import type { Todo } from '../types/todo'

/** Format ISO 8601 createdAt for display (locale-aware medium date). Returns fallback if missing or invalid. */
function formatCreatedAt(createdAt: string): string {
  if (!createdAt || isNaN(new Date(createdAt).getTime())) return '—'
  return new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

export interface TaskCardProps {
  todo: Todo
}

export function TaskCard({ todo }: TaskCardProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-[#eee] bg-[#fafafa] px-4 py-3.5">
      <input
        type="checkbox"
        checked={Boolean(todo.completed)}
        readOnly
        aria-label={todo.completed ? 'Task completed' : 'Task not completed'}
        className="h-5 w-5 flex-shrink-0 rounded border-2 border-gray-700"
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
