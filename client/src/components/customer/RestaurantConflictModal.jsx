"use client";

import { useRef } from "react";
import { TriangleAlert, X } from "lucide-react";
import useFocusTrap from "@hooks/useFocusTrap";

function RestaurantConflictModal({
  open,
  currentRestaurantName = "",
  incomingRestaurantName = "",
  onClose,
  onConfirm,
}) {
  const dialogRef = useRef(null);
  useFocusTrap(open, onClose, dialogRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cocoa/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label="سلة فيها طلب من مطعم تاني"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-[24px] bg-cream p-6 sm:p-7 shadow-[0_32px_64px_-32px_rgba(42,36,28,0.6)] outline-none animate-rise"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
          className="absolute top-3 end-3 w-11 h-11 flex items-center justify-center rounded-full text-cocoa-soft hover:text-terra hover:bg-terra/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <span className="w-14 h-14 rounded-full bg-warning/15 text-warning flex items-center justify-center">
          <TriangleAlert className="w-7 h-7" strokeWidth={1.8} aria-hidden="true" />
        </span>

        <h2 className="mt-5 font-display font-black text-[20px] sm:text-[22px] text-cocoa leading-snug">
          إضافة من مطعم تاني؟
        </h2>
        <p className="mt-2 text-cocoa-soft text-[14.5px] leading-relaxed">
          سلتك الحالية من{" "}
          <span className="font-bold text-cocoa">{currentRestaurantName}</span>.
        </p>
        <p className="mt-1.5 text-cocoa-soft text-[13px] leading-relaxed">
          إذا أضفت من {incomingRestaurantName} رح تضيع طلبيتك الحالية.
        </p>

        <div className="mt-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 rounded-full bg-terra text-cream font-bold text-[15px] flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            أفرغ السلة وكمّل
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-full border-2 border-clay/20 text-cocoa font-bold text-[15px] flex items-center justify-center hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestaurantConflictModal;
