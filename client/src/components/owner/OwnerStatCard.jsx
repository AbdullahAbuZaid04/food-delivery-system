// OwnerStatCard — a KPI tile for the dashboard overview.
export default function OwnerStatCard({
  icon,
  iconTone = "bg-primary/10 text-primary",
  label,
  value,
  hint,
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px] font-bold text-muted">{label}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-display text-[26px] font-black leading-none text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[12px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function formatStatNumber(value) {
  return String(Number(value) || 0);
}
