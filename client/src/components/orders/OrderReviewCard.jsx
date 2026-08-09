"use client";

import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toArabicDigits } from "@lib/format";

// Star picker row. Each star is a real <button> (44px touch target, ARIA
// label + pressed state) so the rating is reachable by keyboard.
function StarRow({ value, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  if (readOnly) {
    return (
      <div
        role="img"
        aria-label={`تقييم ${toArabicDigits(value)} من ٥`}
        className="flex items-center gap-1"
      >
        {stars.map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={`h-7 w-7 ${
              star <= value ? "fill-gold text-gold" : "text-clay/30"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="تقييم من ١ إلى ٥ نجوم">
      {stars.map((star) => {
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`${toArabicDigits(star)} من ٥ نجوم`}
            aria-pressed={selected}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 hover:bg-gold/10"
          >
            <Star
              aria-hidden="true"
              className={`h-7 w-7 transition-colors ${
                selected ? "fill-gold text-gold" : "text-clay/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// Post-delivery review card on the order-tracking screen. Shows the submitted
// rating once a review exists; otherwise renders the rating form. The server
// guards eligibility (DELIVERED + one review per order).
export default function OrderReviewCard({ review, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (review) {
    return (
      <section
        aria-labelledby="order-review-title"
        className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
      >
        <h2
          id="order-review-title"
          className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
        >
          <Star className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
          تقييمك للطلب
        </h2>

        <div className="mt-4">
          <StarRow value={review.rating} readOnly />
          <p className="mt-3 text-[14px] leading-relaxed text-cocoa">
            {review.comment || "بدون تعليق"}
          </p>
          <p className="mt-3 text-[12.5px] text-cocoa-soft">
            شكرًا لتقييمك! تقييمك بيظهر عند المطعم.
          </p>
        </div>
      </section>
    );
  }

  const canSubmit = rating > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
    } catch (err) {
      setError(err?.message || "صارت مشكلة في إرسال التقييم، جرب مرة تانية.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="order-review-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="order-review-title"
        className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
      >
        <Star className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
        قيّم طلبك
      </h2>

      <p className="mt-2 text-[13.5px] leading-relaxed text-cocoa-soft">
        كيف كانت تجربتك مع المطعم؟ تقييمك بيساعد غيرك بالاختيار.
      </p>

      <div className="mt-4">
        <StarRow value={rating} onChange={setRating} />
      </div>

      <div className="mt-4">
        <label
          htmlFor="review-comment"
          className="block text-[13px] font-bold text-cocoa"
        >
          ملاحظة (اختياري)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="شارك تجربتك…"
          className="mt-2 w-full resize-none rounded-2xl border border-clay/20 bg-white px-4 py-3 text-[14px] text-cocoa outline-none transition-colors placeholder:text-cocoa-soft/60 focus:border-terra focus:ring-2 focus:ring-terra/30"
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13px] font-semibold text-error leading-relaxed"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terra px-6 font-bold text-[15px] text-cream shadow-[0_12px_28px_-10px_rgba(193,79,43,0.7)] transition-colors hover:bg-terra-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2
              className="h-5 w-5 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            عم نرسل…
          </>
        ) : (
          "إرسال التقييم"
        )}
      </button>
    </section>
  );
}
