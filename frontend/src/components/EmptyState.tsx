/**
 * Empty state: "No tasks yet" message.
 * Focusable and screen-reader accessible (UX-DR5).
 */
export function EmptyState() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-4 p-container-padding min-h-[12rem] text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded-card"
      aria-label="No tasks"
      tabIndex={0}
    >
      <p className="text-body text-text-secondary">No tasks yet.</p>
    </section>
  )
}
