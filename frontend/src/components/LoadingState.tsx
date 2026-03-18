interface LoadingStateProps {
  message?: string
}

/**
 * Loading state: spinner and accessible "Loading tasks" text.
 * aria-busy and aria-live per UX-DR6 for assistive tech.
 */
export function LoadingState({ message = 'Loading tasks' }: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-container-padding min-h-[12rem]"
      aria-busy="true"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin"
        role="img"
        aria-hidden
      />
      <span className="sr-only text-body text-text-primary">{message}</span>
    </div>
  )
}
