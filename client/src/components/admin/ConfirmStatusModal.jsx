"use client";

import { AlertTriangle, X } from "lucide-react";
import { useRef } from "react";
import useFocusTrap from "@hooks/useFocusTrap";

export default function ConfirmStatusModal({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onClose,
}) {
  const panelRef = useRef(null);
  useFocusTrap(open, onClose, panelRef, { restoreFocus: false });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="document"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl outline-none animate-rise"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-border bg-background text-sm font-bold text-foreground transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-11 flex-1 rounded-xl bg-error text-sm font-bold text-white transition-colors hover:bg-error/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40 disabled:opacity-60"
          >
            {busy ? "عم ننفّذ…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
