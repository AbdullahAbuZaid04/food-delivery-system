"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

// OwnerModal — accessible modal shell for the dashboard (focus trap, scroll
// lock, Escape-to-close, AGENTS.md §7). `children` is the body; `footer` is
// rendered in the bottom action bar.
export default function OwnerModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="إغلاق النافذة"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-2xl outline-none animate-rise"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-display text-[17px] font-bold text-foreground">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border p-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
