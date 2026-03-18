/**
 * Empty state: "No tasks yet" message.
 * Screen-reader accessible (UX-DR5). No focusable control — section is not in tab order per WCAG (no positive tabIndex on non-interactive elements).
 */
export function EmptyState() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-4 p-container-padding min-h-[12rem] text-text-secondary rounded-card"
      aria-label="No tasks"
    >
      <p className="text-body text-text-secondary">No tasks yet.</p>
    </section>
  )
}
