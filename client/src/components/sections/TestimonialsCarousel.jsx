"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef, useState } from "react";
import Ornament from "@components/ui/Ornament";
import StarRow from "@components/ui/StarRow";
import { testimonials } from "@lib/constants";

/**
 * TestimonialsCarousel — full-width olive band with a swipe/keyboard-accessible
 * testimonial carousel (id="voice"). Owns its active-index state, touch/swipe
 * handlers and all the carousel ARIA (aria-live, aria-current, controls).
 */
function TestimonialsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () =>
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const prevTestimonial = () =>
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));

  // swipe support for the testimonial carousel on touch screens
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextTestimonial();
      else prevTestimonial();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="voice"
      className="scroll-mt-24 bg-olive-deep py-16 lg:py-24 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-gold/10 blur-[90px]" />
      <div className="relative max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <Ornament light />
        <h2 className="font-display font-black text-[clamp(28px,3.6vw,40px)] text-cream text-center mt-4">
          كلام الزباين، بألسنتهم
        </h2>
        <p className="text-cream/70 text-center mt-3 max-w-[560px] mx-auto">
          كلام حقيقي من زباين بيطلبو من المطاعم كل يوم.
        </p>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="شهادات الزباين"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative mt-12 bg-olive/25 border border-cream/10 rounded-[32px] px-7 py-12 sm:px-14 lg:px-20 overflow-hidden"
        >
          <Quote
            className="absolute top-8 right-8 w-20 h-20 text-gold/15"
            strokeWidth={1.2}
            fill="currentColor"
            aria-hidden="true"
          />
          <div className="relative">
            <StarRow className="justify-center" />

            {/* min-height prevents layout shift when text length changes between testimonials */}
            <div
              className="min-h-[160px] sm:min-h-[130px] flex items-center justify-center"
              aria-live="polite"
            >
              <p className="font-display font-bold text-[clamp(19px,2.4vw,25px)] leading-[1.7] text-cream text-center transition-opacity duration-300">
                {testimonials[activeIndex].quote}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-11 h-11 rounded-full bg-terra text-cream font-display font-bold flex items-center justify-center">
                {testimonials[activeIndex].initial}
              </div>
              <div className="text-right">
                <p className="font-display font-semibold text-cream text-[15px]">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-[13px] text-cream/70">
                  {testimonials[activeIndex].location} — زبون/ة من{" "}
                  {testimonials[activeIndex].year}
                </p>
              </div>
            </div>

            {/* Carousel controls: arrows + dots */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-11 h-11 rounded-full border border-cream/20 text-cream/70 hover:bg-cream/10 hover:text-cream flex items-center justify-center transition-colors"
                aria-label="الرأي السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`الرأي ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                    className={`w-3 h-3 rounded-full transition-colors p-2 m-2 ${
                      i === activeIndex ? "bg-gold" : "bg-cream/30"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-11 h-11 rounded-full border border-cream/20 text-cream/70 hover:bg-cream/10 hover:text-cream flex items-center justify-center transition-colors"
                aria-label="الرأي التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;
