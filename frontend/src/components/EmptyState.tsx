/**
 * Empty state: "No tasks yet" message.
 * Focusable and screen-reader accessible (UX-DR5).
 */
export function EmptyState() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-4 p-8 min-h-[12rem]"
      aria-label="No tasks"
      tabIndex={0}
    >
      <p className="text-gray-700">No tasks yet.</p>
    </section>
  )
}
