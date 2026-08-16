"use client";

import Link from "next/link";
import { RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import OwnerEmptyState from "@components/owner/OwnerEmptyState";
import OwnerPageHeader from "@components/owner/OwnerPageHeader";
import RefreshButton from "@components/owner/RefreshButton";
import ReviewCard from "@components/owner/ReviewCard";
import { OwnerListSkeleton } from "@components/owner/OwnerSkeleton";
import { useOwner } from "@context/OwnerContext";
import { dashboardApi, reviewApi } from "@lib/api";
import { formatRating, reviewToOwnerCard } from "@lib/api/presenters";
import { formatTime } from "@lib/format";

export default function OwnerReviewsPage() {
  const { restaurant, restaurantLoading } = useOwner();
  const restaurantId = restaurant?.id;
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(
    async () => {
      if (!restaurantId) return;
      setLoading(true);
      setError(null);
      try {
        const [list, stats] = await Promise.all([
          reviewApi.getRestaurantReviews(restaurantId, { limit: 100 }),
          dashboardApi.getDashboardStats(),
        ]);
        setReviews((Array.isArray(list) ? list : []).map(reviewToOwnerCard));
        setSummary({
          total: stats.reviews?.total ?? 0,
          averageRating: stats.reviews?.averageRating ?? null,
        });
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || "تعذر تحميل التقييمات، حاول مرة تانية.");
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (restaurantId) load();
  }, [restaurantId, load]);

  if (restaurantLoading) return <OwnerListSkeleton rows={3} />;

  if (!restaurant) {
    return (
      <OwnerEmptyState
        icon={<Star className="h-6 w-6" aria-hidden="true" />}
        title="عمّر مطعمك الأول"
        description="لما يبلش الزبائن يطلبو ويقيّمو، التقييمات رح تظهر هون."
      >
        <Link
          href="/owner"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          روح لإعداد المطعم
        </Link>
      </OwnerEmptyState>
    );
  }

  return (
    <div>
      <OwnerPageHeader
        title="التقييمات"
        subtitle={
          summary
            ? `${summary.total} تقييم — متوسط ${summary.averageRating ? formatRating(summary.averageRating, true) : "—"} من 5`
            : "شو بيحكوا الزبائن عن مطعمك"
        }
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {lastUpdated ? (
              <span className="text-[12px] text-muted">
                آخر تحديث {formatTime(lastUpdated.toISOString(), true)}
              </span>
            ) : null}
            <RefreshButton loading={loading} onClick={load} label="حدّث" />
          </div>
        }
      />

      {error ? (
        <OwnerEmptyState
          icon={<RefreshCw className="h-6 w-6" aria-hidden="true" />}
          title="صار في شي غلط"
          description={error}
        >
          <button
            type="button"
            onClick={load}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            حاول مرة تانية
          </button>
        </OwnerEmptyState>
      ) : null}

      {!error && loading && reviews.length === 0 ? (
        <OwnerListSkeleton rows={3} />
      ) : null}

      {!error && !loading && reviews.length === 0 ? (
        <OwnerEmptyState
          icon={<Star className="h-6 w-6" aria-hidden="true" />}
          title="ما في تقييمات بعد"
          description="لما أول زبون يخلّص طلبه ويقيّم، التقييم رح يظهر هون."
        />
      ) : null}

      {!error && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
