"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Bike, Clock, Star } from "lucide-react";
import { toArabicDigits, formatPrice } from "@lib/format";

/**
 * RestaurantHeader — premium hero: the restaurant name + category chip sit on
 * the cover's bottom gradient (readable, drop-shadowed), and a trio of stat
 * cards (rating · delivery time · delivery fee) sits right below so the menu
 * is reachable fast.
 */
function RestaurantHeader({
  restaurant,
  coverImage,
  reviewCount = 0,
  deliveryFee = 0,
}) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const stats = [
    {
      label: "التقييم",
      chip: "bg-gold/15",
      icon: (
        <Star
          className="w-4 h-4 text-gold"
          strokeWidth={0}
          fill="currentColor"
          aria-hidden="true"
        />
      ),
      value: (
        <>
          <span className="font-display font-bold text-[14px] md:text-[15px] text-cocoa">
            {restaurant.rating}
          </span>
          {reviewCount > 0 ? (
            <span className="text-[10.5px] text-cocoa-soft">
              ({toArabicDigits(reviewCount)})
            </span>
          ) : null}
        </>
      ),
    },
    {
      label: "وقت التوصيل",
      chip: "bg-terra/15",
      icon: <Clock className="w-4 h-4 text-terra" aria-hidden="true" />,
      value: (
        <span className="font-display font-bold text-[14px] md:text-[15px] text-cocoa">
          {restaurant.time}
        </span>
      ),
    },
    {
      label: "رسوم التوصيل",
      chip: "bg-olive/15",
      icon: <Bike className="w-4 h-4 text-olive" aria-hidden="true" />,
      value: (
        <span className="font-display font-bold text-[14px] md:text-[15px] text-cocoa">
          {deliveryFee > 0 ? formatPrice(deliveryFee) : "مجاني"}
        </span>
      ),
    },
  ];

  return (
    <header>
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
          className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/30 to-cocoa/10"
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
          <span className="h-9 inline-flex items-center gap-1.5 rounded-full bg-cream/90 backdrop-blur px-3.5 text-[12.5px] font-bold text-cocoa shadow-[0_8px_20px_-8px_rgba(42,36,28,0.5)]">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            مفتوح الآن
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
            <h1 className="text-cream font-display font-black text-[clamp(24px,4vw,40px)] leading-snug drop-shadow-[0_2px_14px_rgba(42,36,28,0.7)]">
              {restaurant.name}
            </h1>
            <span className="mt-2 inline-flex h-8 items-center rounded-full border border-cream/30 bg-cream/20 backdrop-blur px-4 text-[12.5px] font-bold text-cream">
              {restaurant.category}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 md:pt-6">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-2xl border border-clay/10 bg-cream-deep px-2 py-3 text-center shadow-[0_6px_16px_-12px_rgba(42,36,28,0.4)]"
            >
              <span className="flex items-center justify-center gap-1.5 min-w-0">
                <span
                  className={`flex w-7 h-7 shrink-0 items-center justify-center rounded-lg ${stat.chip}`}
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
                <span className="flex items-baseline gap-1 min-w-0">
                  {stat.value}
                </span>
              </span>
              <span className="text-[11px] text-cocoa-soft">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export default RestaurantHeader;
