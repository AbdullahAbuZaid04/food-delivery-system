// AdminStatCard — the shared stat/count card used across the admin screens
// (overview + restaurant detail). Matches the role-distribution cards: the
// icon sits on the right (RTL start), the number next to it, and the label
// directly under the number — no truncation on narrow (2-per-row) mobile cards.
export default function AdminStatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="block font-display text-xl font-black leading-none text-foreground">
            {value}
          </span>
          <span className="mt-1 block text-[12.5px] font-semibold text-muted">
            {label}
          </span>
        </span>
      </span>
    </div>
  );
}
