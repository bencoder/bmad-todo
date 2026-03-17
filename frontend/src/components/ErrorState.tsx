/**
 * Error state: clear message and Retry button when list fails to load.
 * role="alert" announces the error to assistive tech; Retry is primary and focusable (UX-DR7, UX-DR11).
 */
export const DEFAULT_ERROR_MESSAGE = "Couldn't load tasks"

export interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

function normalizeMessage(message: string | undefined): string {
  const s = message != null ? String(message).trim() : ''
  return s !== '' ? s : DEFAULT_ERROR_MESSAGE
}

export function ErrorState({ message = DEFAULT_ERROR_MESSAGE, onRetry }: ErrorStateProps) {
  const displayMessage = normalizeMessage(message)
  return (
    <section
      className="flex flex-col items-center justify-center gap-4 p-8 min-h-[12rem]"
      aria-label="Error loading tasks"
    >
      <div role="alert">
        {displayMessage}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
        aria-label="Retry"
      >
        Retry
      </button>
    </section>
  )
}
