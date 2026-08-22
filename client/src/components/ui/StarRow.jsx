import { Star } from "lucide-react";
import { toArabicDigits } from "@lib/format";

/**
 * StarRow — five-star rating row, rendered with gold stars.
 * Pass `rating` (number 0–5) to show a proportional fill; without it the row
 * renders a full 5-star rating (testimonials, marketing).
 * @param {number} [rating] - numeric rating 0–5.
 * @param {string} [className] - extra classes appended to the flex row.
 */
function StarRow({ rating, className = "" }) {
  const value = Number(rating);
  const hasRating =
    rating !== undefined &&
    rating !== null &&
    rating !== "" &&
    Number.isFinite(value);
  const filled = hasRating ? Math.max(0, Math.min(5, Math.round(value))) : 5;
  const label = hasRating
    ? `تقييم ${toArabicDigits(String(value).replace(".", "٫"))} من ٥`
    : "تقييم ٥ من ٥";

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center gap-1 ${className}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < filled
              ? "text-gold fill-current"
              : "text-clay/30 fill-transparent"
          }`}
          strokeWidth={i < filled ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

export default StarRow;
