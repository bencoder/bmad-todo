/**
 * Empty state: "No tasks yet" message and add affordance.
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
      <button type="button" className="text-gray-900 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-700 rounded">
        Add your first task
      </button>
    </section>
  )
}
