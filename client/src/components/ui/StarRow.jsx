import { Star } from "lucide-react";

/**
 * StarRow — five-star rating row, rendered with gold stars.
 * @param {string} [className] - extra classes appended to the flex row.
 */
function StarRow({ className = "" }) {
  return (
    <div
      role="img"
      className={`flex items-center gap-1 text-gold ${className}`}
      aria-label="تقييم ٤٫٩ من ٥"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4" fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

export default StarRow;
