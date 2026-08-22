export default function OwnerPageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px] font-black text-foreground">
          {title}
        </h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-1.5 text-[13.5px] text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
