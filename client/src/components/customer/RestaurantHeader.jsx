"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Bike, Clock, Heart, Star } from "lucide-react";
import StarRow from "@components/ui/StarRow";
import { toArabicDigits } from "@lib/format";

function StatCard({ label, accent, icon, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-clay/10 bg-cream-deep px-4 py-3.5">
      <span
        className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl ${accent}`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-cocoa-soft">{label}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-cocoa">
          {children}
        </div>
      </div>
    </div>
  );
}

function RestaurantHeader({
  restaurant,
  coverImage,
  reviewCount = 0,
  isFavorite = false,
  onToggleFavorite,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <header className="relative">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] overflow-hidden bg-olive-deep">
        <Image
          src={coverImage}
          alt={`واجهة مطعم ${restaurant.name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-cocoa/75 via-cocoa/25 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute top-3 start-3 sm:top-4 sm:start-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="رجوع للصفحة السابقة"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-cream/95 backdrop-blur text-cocoa shadow-[0_10px_24px_-8px_rgba(42,36,28,0.6)] hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream"
          >
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="absolute top-3 end-3 sm:top-4 sm:end-4">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `إزالة ${restaurant.name} من المفضلة`
                : `إضافة ${restaurant.name} إلى المفضلة`
            }
            className={`w-11 h-11 flex items-center justify-center rounded-full shadow-[0_10px_24px_-8px_rgba(42,36,28,0.6)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream ${
              isFavorite
                ? "bg-terra text-cream"
                : "bg-cream/95 backdrop-blur text-cocoa-soft hover:text-terra"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="pt-6 md:pt-8">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <h1 className="font-display font-black text-[clamp(26px,4vw,40px)] leading-snug text-cocoa">
              {restaurant.name}
            </h1>
            <span className="h-9 inline-flex items-center rounded-full border border-clay/15 bg-parchment px-4 text-[13px] font-bold text-terra">
              {restaurant.category}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label="التقييم"
              accent="bg-gold/20 text-terra"
              icon={<Star className="w-5 h-5 fill-current" strokeWidth={0} />}
            >
              <StarRow />
              <span className="font-display font-bold text-[15px]">
                {restaurant.rating}
              </span>
              {reviewCount > 0 ? (
                <span className="text-[12px] text-cocoa-soft">
                  ({toArabicDigits(reviewCount)} تقييم)
                </span>
              ) : null}
            </StatCard>

            <StatCard
              label="وقت التوصيل"
              accent="bg-terra/12 text-terra"
              icon={<Clock className="w-5 h-5" />}
            >
              <span className="font-display font-bold text-[15px]">
                خلال {restaurant.time}
              </span>
            </StatCard>

            <StatCard
              label="رسوم التوصيل"
              accent="bg-olive/15 text-olive"
              icon={<Bike className="w-5 h-5" />}
            >
              <span className="font-display font-bold text-[15px]">
                {restaurant.delivery}
              </span>
            </StatCard>
          </div>
        </div>
      </div>
    </header>
  );
}

export default RestaurantHeader;
