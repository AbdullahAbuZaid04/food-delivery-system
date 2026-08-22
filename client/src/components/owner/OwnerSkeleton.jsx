// OwnerSkeleton — loading placeholders for the dashboard (AGENTS.md §8: avoid
// layout shift on content whose length varies).
export function OwnerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="h-4 w-24 rounded-md bg-muted/15 animate-pulse motion-reduce:animate-none" />
      <div className="mt-4 h-8 w-32 rounded-md bg-muted/15 animate-pulse motion-reduce:animate-none" />
      <div className="mt-3 h-3 w-40 rounded-md bg-muted/10 animate-pulse motion-reduce:animate-none" />
    </div>
  );
}

export function OwnerListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-40 rounded-md bg-muted/15 animate-pulse motion-reduce:animate-none" />
            <div className="h-5 w-20 rounded-full bg-muted/10 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="mt-4 h-3 w-3/4 rounded-md bg-muted/10 animate-pulse motion-reduce:animate-none" />
          <div className="mt-2 h-3 w-1/2 rounded-md bg-muted/10 animate-pulse motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}
