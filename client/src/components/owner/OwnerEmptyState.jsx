// OwnerEmptyState — friendly empty/placeholder panel for owner screens.
export default function OwnerEmptyState({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h2 className="mt-4 font-display text-[19px] font-bold text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
