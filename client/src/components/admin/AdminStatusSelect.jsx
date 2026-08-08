"use client";

// AdminStatusSelect — a plain status picker used in the admin lists/details.
// The parent owns the actual PATCH via onRequestChange so destructive
// transitions (BLOCKED / SUSPENDED) can be routed through a confirm modal.
export default function AdminStatusSelect({
  value,
  statuses,
  labelFor,
  onRequestChange,
  disabled = false,
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onRequestChange(event.target.value)}
      aria-label="تغيير الحالة"
      className="h-11 rounded-xl border border-border bg-background px-3 text-[13.5px] font-bold text-foreground transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {labelFor(status)}
        </option>
      ))}
    </select>
  );
}
