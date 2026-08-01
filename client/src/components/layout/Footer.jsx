import Link from "next/link";
import { Bike, ChevronLeft, Mail, MapPin, Phone, Leaf } from "lucide-react";
import BrandMark from "@components/ui/BrandMark";

/**
 * Footer — brand column, quick links, contact channels and the closing line.
 */
function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-cream-deep border-t border-clay/10 pt-14 pb-8"
    >
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2.5 text-terra">
              <BrandMark />
              <span className="font-display font-black text-xl text-cocoa">
                وجبة
              </span>
            </a>
            <p className="text-[13.5px] text-cocoa-soft leading-relaxed mt-4 max-w-[320px]">
              منصة توصيل بتمتّعك بأكل البيت من أكتر من ١٢٠ مطعم بقطاع غزة — كلها
              بمكان واحد، وبضغطة وحدة.
            </p>
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-clay/10 bg-cream px-4 py-3 mt-6">
              <Bike className="w-5 h-5 text-terra shrink-0" />
              <p className="text-[12.5px] text-cocoa-soft leading-snug">
                توصيل لكل مناطق قطاع غزة
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-[15px] text-cocoa">
              روابط سريعة
            </h3>
            <span className="block h-0.5 w-8 bg-terra rounded-full mt-2" />
            <ul className="mt-4 text-[13.5px] text-cocoa-soft">
              <li>
                <a
                  href="#restaurants"
                  className="group flex items-center gap-2 py-2 hover:text-terra transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cocoa-soft/50 group-hover:text-terra transition-colors" />
                  المطاعم
                </a>
              </li>
              <li>
                <a
                  href="#how"
                  className="group flex items-center gap-2 py-2 hover:text-terra transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cocoa-soft/50 group-hover:text-terra transition-colors" />
                  كيف بتوصل؟
                </a>
              </li>
              <li>
                <a
                  href="#voice"
                  className="group flex items-center gap-2 py-2 hover:text-terra transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cocoa-soft/50 group-hover:text-terra transition-colors" />
                  كلام الزباين
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="group flex items-center gap-2 py-2 hover:text-terra transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cocoa-soft/50 group-hover:text-terra transition-colors" />
                  سجّل الدخول
                </Link>
              </li>
              <li>
                <a
                  href="register"
                  className="group flex items-center gap-2 py-2 hover:text-terra transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cocoa-soft/50 group-hover:text-terra transition-colors" />
                  سجّل مطعمك معنا
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-[15px] text-cocoa">
              كلمنا
            </h3>
            <span className="block h-0.5 w-8 bg-terra rounded-full mt-2" />
            <ul className="mt-4 space-y-3 text-[13.5px] text-cocoa-soft">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-terra shrink-0" />
                <span dir="ltr" className="font-medium">
                  support@wajba.ps
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-terra shrink-0" />
                غزة — قطاع غزة
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-terra shrink-0" />
                <span dir="ltr" className="font-medium">
                  0590000000
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-10 border-t border-clay/15">
          <span className="text-[13px] text-cocoa-soft">© ٢٠٢٦ وجبة</span>
          <span className="inline-flex items-center gap-2 text-[13px] text-cocoa-soft">
            <Leaf className="w-4 h-4 text-terra" />
            بكل حب، من مطاعم غزة لبيتك
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
