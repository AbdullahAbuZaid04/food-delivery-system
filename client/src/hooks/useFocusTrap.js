"use client";

import { useEffect } from "react";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]';

export default function useFocusTrap(open, onClose, panelRef, { restoreFocus = true } = {}) {
  // Scroll lock + initial focus
  useEffect(() => {
    if (!open) return;
    const prev = restoreFocus ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      if (restoreFocus && prev?.focus) prev.focus();
    };
  }, [open, panelRef, restoreFocus]);

  // Escape-to-close + Tab focus trap
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!els || els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, panelRef]);
}
