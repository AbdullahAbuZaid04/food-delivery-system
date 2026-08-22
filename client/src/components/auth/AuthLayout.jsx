import Link from "next/link";
import BrandMark from "@components/ui/BrandMark";
import Ornament from "@components/ui/Ornament";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal flex flex-col items-center justify-center px-4 py-12 overflow-x-hidden">
      <div className="w-full max-w-[440px]">
        <Link
          href="/"
          aria-label="وجبة — الرجوع للصفحة الرئيسية"
          className="flex items-center justify-center gap-2.5 text-terra mb-8"
        >
          <BrandMark />
          <span className="font-display font-black text-2xl text-cocoa">
            وجبة
          </span>
        </Link>

        <div className="bg-white rounded-[24px] border border-clay/15 shadow-[0_30px_70px_-35px_rgba(42,36,28,0.45)] px-5 py-8 sm:px-8">
          <h1 className="font-display font-black text-[26px] leading-snug text-cocoa text-center">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-sm sm:text-[15px] text-cocoa-soft text-center mt-2 leading-relaxed">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-5 flex justify-center">
            <Ornament />
          </div>

          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
