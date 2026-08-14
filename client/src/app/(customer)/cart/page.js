"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Lock, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import AppHeader from "@components/customer/AppHeader";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { formatArabicCount, formatPrice, toArabicDigits } from "@lib/format";
import { DEFAULT_MEAL_IMAGE } from "@lib/api/presenters";

function EmptyCart() {
  return (
    <section className="mt-10 md:mt-12 min-h-[320px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-clay/25 bg-cream-deep/60 px-6 py-14 text-center">
      <span className="w-16 h-16 rounded-full bg-terra/10 flex items-center justify-center">
        <ShoppingCart
          className="w-8 h-8 text-terra"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>
      <h2 className="font-display font-bold text-[20px] text-cocoa mt-5">
        سلتك لسّا فاضية
      </h2>
      <p className="text-cocoa-soft text-[14.5px] mt-2 leading-relaxed max-w-sm">
        مافيش ولا صنف بالسلة لحد هسا. كمّل تصفّح المطاعم وضيف اللي بيعجبك.
      </p>
      <Link
        href="/home"
        className="mt-6 inline-flex items-center justify-center bg-terra text-cream font-bold text-[15px] px-7 py-3.5 rounded-full shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
      >
        شوف المطاعم
      </Link>
    </section>
  );
}

function ClearCartDialog({ open, restaurantName, itemCount, onClose, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll(
        "button:not([disabled])",
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
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused?.focus) previouslyFocused.focus();
    };
  }, [open, onClose]);

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
        aria-label="تأكيد مسح السلة"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-[24px] bg-cream p-6 sm:p-7 shadow-[0_32px_64px_-32px_rgba(42,36,28,0.6)] outline-none animate-rise"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
          className="absolute top-3 end-3 w-11 h-11 flex items-center justify-center rounded-full text-cocoa-soft hover:text-error hover:bg-error/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <span className="w-14 h-14 rounded-full bg-error/15 text-error flex items-center justify-center">
          <Trash2 className="w-7 h-7" strokeWidth={1.8} aria-hidden="true" />
        </span>

        <h2 className="mt-5 font-display font-black text-[20px] sm:text-[22px] text-cocoa leading-snug">
          امسح كل السلة؟
        </h2>
        <p className="mt-2 text-cocoa-soft text-[14.5px] leading-relaxed">
          رح نمسح {formatArabicCount(itemCount)} من{" "}
          <span className="font-bold text-cocoa">{restaurantName}</span>.
        </p>
        <p className="mt-1.5 text-cocoa-soft text-[13px] leading-relaxed">
          هالإجراء ما رح يترجع.
        </p>

        <div className="mt-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 rounded-full bg-error text-cream font-bold text-[15px] flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(220,38,38,0.7)] hover:bg-error/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
          >
            نعم، امسح
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-full border-2 border-clay/20 text-cocoa font-bold text-[15px] flex items-center justify-center hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            لا، رجّع
          </button>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ entry, onIncrement, onDecrement }) {
  return (
    <li className="flex items-center gap-3 sm:gap-4 rounded-[24px] border border-clay/10 bg-cream-deep p-3 sm:p-4">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl overflow-hidden border border-clay/10 bg-cream">
        <Image
          src={entry.image || DEFAULT_MEAL_IMAGE}
          alt={entry.name}
          fill
          sizes="(max-width: 640px) 64px, 80px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-[15px] sm:text-[16px] text-cocoa truncate">
          {entry.name}
        </h3>
        <p className="mt-1 font-display font-bold text-[14.5px] text-terra">
          {formatPrice(entry.price)}
        </p>
      </div>

      <div className="flex items-center rounded-full bg-terra text-cream overflow-hidden shrink-0">
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`زِد كمية ${entry.name}`}
          className="w-11 h-11 flex items-center justify-center hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
        </button>
        <span aria-live="polite" className="min-w-8 text-center font-bold text-[14px]">
          {toArabicDigits(entry.quantity)}
        </span>
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`نقّص كمية ${entry.name}`}
          className="w-11 h-11 flex items-center justify-center hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream"
        >
          <Minus className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function CartPage() {
  const { user, status } = useAuth();
  const {
    restaurantName,
    items,
    totalItems,
    totalPrice,
    deliveryFee,
    updateQuantity,
    clearCart,
  } = useCart();
  const [isClearOpen, setIsClearOpen] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  const isGuest = !user;
  const isAuthLoading = status === "loading";

  const handleIncrement = (entry) => {
    updateQuantity(entry.menuItemId, entry.quantity + 1);
  };

  const handleDecrement = (entry) => {
    updateQuantity(entry.menuItemId, entry.quantity - 1);
    if (entry.quantity - 1 <= 0) {
      toast.success(`شلنا "${entry.name}" من السلة`);
    }
  };

  const handleConfirmClear = () => {
    clearCart();
    setIsClearOpen(false);
    toast.success("انمسحت السلة بالكامل");
  };

  if (items.length === 0) {
    return (
      <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
        <AppHeader userName={userName} showSearch={false} />
        <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
          <EmptyCart />
        </main>
      </div>
    );
  }

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
              سلتك
            </h1>
            <p className="mt-1 text-cocoa-soft text-[14px]">من {restaurantName}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsClearOpen(true)}
            aria-label="امسح السلة بالكامل"
            className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border-2 border-clay/20 text-cocoa-soft font-bold text-[14px] hover:border-error hover:text-error hover:bg-error/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
          >
            <Trash2 className="w-4.5 h-4.5" aria-hidden="true" />
            امسح السلة
          </button>
        </header>

        <ul className="mt-6 space-y-3">
          {items.map((entry) => (
            <CartItemRow
              key={entry.menuItemId}
              entry={entry}
              onIncrement={() => handleIncrement(entry)}
              onDecrement={() => handleDecrement(entry)}
            />
          ))}
        </ul>

        <section className="mt-8 rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6">
          <h2 className="sr-only">ملخص السلة</h2>

          <div className="flex items-center justify-between gap-3">
            <span className="text-cocoa-soft text-[14.5px]">عدد العناصر</span>
            <span className="font-bold text-cocoa">
              {formatArabicCount(totalItems)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-clay/10 pt-3">
            <span className="text-cocoa-soft text-[14.5px]">المجموع الفرعي</span>
            <span className="font-bold text-cocoa">{formatPrice(totalPrice)}</span>
          </div>

          {deliveryFee > 0 ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-cocoa-soft text-[14.5px]">رسوم التوصيل</span>
              <span className="font-bold text-cocoa">
                {formatPrice(deliveryFee)}
              </span>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-clay/10 pt-3">
            <span className="text-cocoa-soft text-[14.5px]">السعر الإجمالي</span>
            <span className="font-display font-black text-[20px] text-terra">
              {formatPrice(totalPrice + (deliveryFee || 0))}
            </span>
          </div>

          {isAuthLoading ? null : isGuest ? (
            <div className="mt-6" role="alert">
              <div className="rounded-2xl border-2 border-warning/50 bg-warning/10 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-[15px] text-cocoa">
                      إكمال الطلب متوقف هلق
                    </p>
                    <p className="mt-1 text-[13.5px] text-cocoa-soft leading-relaxed">
                      أنت دخّلت من غير حساب، وعشان تكمّل خطوة الدفع لازم تسجّل
                      دخولك الأول. سلتك رح تفضل محفوظة عندك.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login?next=/cart"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-terra text-cream font-bold text-[15px] shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register?next=/cart"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border-2 border-clay/20 text-cocoa font-bold text-[15px] hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              </div>
            </div>
          ) : isAuthLoading ? null : (
            <>
              <Link
                href="/checkout"
                className="mt-6 w-full h-14 rounded-full bg-terra text-cream font-bold text-[16px] flex items-center justify-center gap-2 shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
                أكمل الطلب
              </Link>
              <p className="mt-2 text-center text-[12.5px] text-cocoa-soft">
                خطوة وحدة: عنوانك + طريقة الدفع
              </p>
            </>
          )}
        </section>
      </main>

      <ClearCartDialog
        open={isClearOpen}
        restaurantName={restaurantName}
        itemCount={totalItems}
        onClose={() => setIsClearOpen(false)}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}

export default CartPage;
