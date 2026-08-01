import { SearchX } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "الصفحة غير موجودة | وجبة",
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-clay/30" aria-hidden="true" />
          <SearchX className="w-8 h-8 text-terra" strokeWidth={1.6} />
          <span className="h-px w-10 bg-clay/30" aria-hidden="true" />
        </div>
        <p className="font-display font-black text-[clamp(64px,12vw,120px)] leading-none text-cocoa mt-6">
          ٤٠٤
        </p>
        <h1 className="font-display font-black text-[clamp(24px,3.6vw,32px)] text-cocoa mt-4">
          هالصفحة مش موجودة
        </h1>
        <p className="text-cocoa-soft leading-relaxed mt-3">
          يبدو إنك طلعت على صفحة ما فينا نلاقيها — بس طلبك لسّا بوصل بسرعة.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-terra text-cream font-bold text-base px-8 py-3.5 rounded-full mt-8 shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors"
        >
          ارجع للرئيسية
        </Link>
      </div>
    </div>
  );
}
