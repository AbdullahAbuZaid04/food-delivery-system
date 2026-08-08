import { Star } from "lucide-react";
import { formatOwnerDateTime } from "@lib/api/presenters";

export default function ReviewCard({ review }) {
  const initial = review.customerName.trim().charAt(0) || "ز";

  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-[15px] font-bold text-white"
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-bold text-foreground">
              {review.customerName}
            </p>
            <p className="text-[12px] text-muted">
              {formatOwnerDateTime(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div
            role="img"
            aria-label={`تقييم ${review.rating} من 5`}
            className="flex items-center gap-0.5"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                aria-hidden="true"
                className={`h-4 w-4 ${
                  value <= review.rating
                    ? "fill-gold text-gold"
                    : "text-muted/40"
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] font-bold text-muted">
            {review.rating} / 5
          </span>
        </div>
      </div>

      {review.comment ? (
        <p className="mt-4 text-[14px] leading-relaxed text-foreground">
          {review.comment}
        </p>
      ) : (
        <p className="mt-4 text-[13.5px] text-muted">بدون تعليق</p>
      )}
    </article>
  );
}
