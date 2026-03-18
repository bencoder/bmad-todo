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
      className="flex flex-col items-center justify-center gap-4 p-container-padding min-h-[12rem]"
      aria-label="Error loading tasks"
    >
      <div role="alert" className="text-body text-text-primary">
        {displayMessage}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-button bg-primary px-[22px] py-3.5 text-body font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        aria-label="Retry"
      >
        Retry
      </button>
    </section>
  )
}
