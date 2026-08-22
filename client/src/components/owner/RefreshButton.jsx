"use client";

import { RefreshCw } from "lucide-react";

export default function RefreshButton({
  loading = false,
  onClick,
  label = "حدّث",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 ${className}`}
    >
      <RefreshCw
        className={`h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}
