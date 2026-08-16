import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// OwnerStatCard — a KPI tile for the dashboard overview. When `href` is set the
// whole card becomes a link; `highlight` tints it (used for "قيد الانتظار" when
// there are orders waiting for acceptance).
export default function OwnerStatCard({
  icon,
  iconTone = "bg-primary/10 text-primary",
  label,
  value,
  hint,
  href,
  highlight = false,
  cta = "اعرض التفاصيل",
}) {
  const inner = (
    <>
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
      {href ? (
        <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-primary">
          {cta}
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  const cardClass = `group block rounded-2xl border p-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
    highlight
      ? "border-warning/40 bg-warning/5"
      : "border-border bg-surface"
  } ${href ? "hover:border-primary/40 hover:bg-muted/5" : ""}`;

  return href ? (
    <Link href={href} className={cardClass}>
      {inner}
    </Link>
  ) : (
    <div className={cardClass}>{inner}</div>
  );
}

export function formatStatNumber(value) {
  return String(Number(value) || 0);
}
