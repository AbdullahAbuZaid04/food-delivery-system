"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bike, Check, Loader2, X } from "lucide-react";
import { restaurantApi } from "@lib/api";
import { primaryButtonClass, secondaryButtonClass } from "./OwnerFields";

// DriverAssignModal — pick an active driver for a READY order. Loads the
// driver list on open, traps focus and locks scroll while open (AGENTS.md §7).
export default function DriverAssignModal({ order, onClose, onConfirm, busy }) {
  const panelRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setSelectedId(null);
    restaurantApi
      .getDrivers()
      .then((list) => {
        setDrivers(list);
        if (list.length === 1) setSelectedId(list[0].id);
      })
      .catch((err) =>
        setError(err.message || "تعذر تحميل قائمة السواقين، حاول مرة تانية."),
      )
      .finally(() => setLoading(false));
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  useEffect(() => {
    if (!order) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll(
        "button:not([disabled]), input:not([disabled])",
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
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="تعيين سائق للطلب"
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
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl outline-none animate-rise"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bike className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-[17px] font-bold text-foreground">
                تعيين سائق
              </h2>
              <p className="text-[12.5px] text-muted">{order.orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[13.5px] text-muted">
              <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              بجيب السواقين المتاحين…
            </div>
          ) : error ? (
            <p role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error">
              {error}
            </p>
          ) : drivers.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-muted">
              ما في سواقين متاحين هلق — جرّب بعد شوي
            </p>
          ) : (
            <ul className="space-y-2" role="radiogroup" aria-label="اختيار السائق">
              {drivers.map((driver) => {
                const checked = selectedId === driver.id;
                return (
                  <li key={driver.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="driver"
                        value={driver.id}
                        checked={checked}
                        onChange={() => setSelectedId(driver.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          checked ? "border-primary bg-primary text-white" : "border-muted"
                        }`}
                      >
                        {checked ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <span className="truncate text-[14px] font-bold text-foreground">
                          {driver.firstName} {driver.lastName}
                        </span>
                        <span dir="ltr" className="shrink-0 text-[13px] text-muted">
                          {driver.phone}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={secondaryButtonClass}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedId)}
            disabled={!selectedId || busy}
            className={primaryButtonClass}
          >
            {busy ? "بالتعيين…" : "عيّن السائق"}
          </button>
        </div>
      </div>
    </div>
  );
}
