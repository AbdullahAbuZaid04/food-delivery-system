"use client";

import { CookingPot } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error(error);
    // TODO: أرسل الخطأ لخدمة monitoring (Sentry أو ما شابه) قبل الإطلاق النهائي —
    // console.error وحده يضيع بالـ production ومش كافي لتتبع الأخطاء الحقيقية.
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-clay/30" aria-hidden="true" />
          <CookingPot className="w-8 h-8 text-terra" strokeWidth={1.6} />
          <span className="h-px w-10 bg-clay/30" aria-hidden="true" />
        </div>
        <h1 className="font-display font-black text-[clamp(24px,3.6vw,32px)] text-cocoa mt-6">
          صار شي غلط
        </h1>
        <p className="text-cocoa-soft leading-relaxed mt-3">
          بعتذر — صار خطأ غير متوقع بينما كنا عم نجهّز الصفحة. حاول مرة تانية،
          وإذا رجع تاني كلمنا.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center bg-terra text-cream font-bold text-base px-8 py-3.5 rounded-full shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors"
          >
            حاول مرة تانية
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border-2 border-terra text-terra font-bold text-base px-8 py-3 rounded-full hover:bg-terra/5 transition-colors"
          >
            ارجع للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
