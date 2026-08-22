import Image from "next/image";
import Link from "next/link";
import { Leaf, Route } from "lucide-react";
import { HERO_IMAGE } from "@lib/constants";

/**
 * HeroBrowse — the hero's decorative food photo with a leaf accent.
 */
function HeroBrowse() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[500px]">
      <div
        className="absolute -top-5 left-6 w-8 h-8 text-olive/70"
        aria-hidden="true"
      >
        <Leaf className="w-8 h-8" strokeWidth={1.6} />
      </div>

      <div
        className="absolute inset-0 rounded-[36px] rounded-t-[220px] bg-parchment border border-clay/10 -rotate-3"
        aria-hidden="true"
      />

      <div className="relative rotate-1 rounded-[36px] rounded-t-[220px] overflow-hidden border border-clay/15 shadow-[0_44px_90px_-45px_rgba(42,36,28,0.6)]">
        <div className="relative aspect-[4/5]">
          <Image
            src={HERO_IMAGE}
            alt="طبق مشاوي شهي من مطاعم وجبة في غزة"
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-cocoa/10 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/**
 * Hero — top hero section: headline, CTAs, stats and the food visual.
 */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-44 -left-36 w-[540px] h-[540px] rounded-full bg-gold/15 blur-[110px]" />
      <div className="pointer-events-none absolute top-48 -right-36 w-[460px] h-[460px] rounded-full bg-terra/10 blur-[100px]" />

      <div className="relative max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-24 pb-16 lg:pt-28 lg:pb-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-terra font-semibold text-[13.5px]">
            <Leaf className="w-4 h-4" />
            كل مطاعم غزة بمكان واحد
          </span>

          <h1 className="font-display font-black text-[clamp(34px,4.6vw,54px)] leading-[1.35] text-cocoa mt-5">
            طبقك بوصل لباب البيت وهو لسّا{" "}
            <span className="text-terra">ساخن</span>
          </h1>
          <div className="h-1.5 w-44 mt-3 rounded-full bg-gradient-to-r from-terra via-gold to-terra" />

          <p className="text-[17px] text-cocoa-soft max-w-[500px] mt-6 leading-relaxed">
            اختار من أكتر من ١٢٠ مطعم معتمد بغزة، اطلب من مطعمك المفضّل، وتابع
            طلبك من عالفرن لحد ما بيوصلك عالباب — بدون انتظار أعمى، وبسعر واضح.
          </p>

          <div className="flex items-center gap-2 sm:gap-4 mt-8">
            <Link
              href="/home"
              className="inline-flex flex-1 justify-center whitespace-nowrap bg-terra text-cream px-3 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-[14px] sm:text-base items-center gap-1.5 sm:gap-2 shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors"
            >
              شوف المطاعم
              <span aria-hidden="true">←</span>
            </Link>
            <a
              href="#how"
              className="inline-flex flex-1 justify-center whitespace-nowrap items-center gap-1.5 sm:gap-2.5 border-2 border-terra/70 text-terra font-bold text-[14px] sm:text-base px-2 sm:px-6 py-3 sm:py-3.5 rounded-full hover:bg-terra/5 hover:border-terra transition-colors"
            >
              <Route className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              كيف بتوصل؟
            </a>
          </div>

          <div className="flex items-center gap-7 lg:gap-9 mt-10">
            <div>
              <b className="font-display font-black text-[26px] text-cocoa block leading-tight">
                +١٢٠
              </b>
              <span className="text-[13px] text-cocoa-soft">مطعم شريك</span>
            </div>
            <span className="w-px h-9 bg-clay/25" />
            <div>
              <b className="font-display font-black text-[26px] text-cocoa block leading-tight">
                ٢٥ د
              </b>
              <span className="text-[13px] text-cocoa-soft">متوسط التوصيل</span>
            </div>
            <span className="w-px h-9 bg-clay/25" />
            <div>
              <b className="font-display font-black text-[26px] text-cocoa block leading-tight">
                ٤٫٩
              </b>
              <span className="text-[13px] text-cocoa-soft">تقييم الزباين</span>
            </div>
          </div>
        </div>

        <HeroBrowse />
      </div>
    </section>
  );
}

export default Hero;
