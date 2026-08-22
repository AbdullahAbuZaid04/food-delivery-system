"use client";

import Link from "next/link";
import { ChevronLeft, Clock, ReceiptText, RefreshCw, Star, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import OwnerEmptyState from "@components/owner/OwnerEmptyState";
import OwnerPageHeader from "@components/owner/OwnerPageHeader";
import RefreshButton from "@components/owner/RefreshButton";
import OwnerStatCard, { formatStatNumber } from "@components/owner/OwnerStatCard";
import { OwnerCardSkeleton, OwnerListSkeleton } from "@components/owner/OwnerSkeleton";
import RestaurantSetupForm from "@components/owner/RestaurantSetupForm";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import { useOwner } from "@context/OwnerContext";
import { dashboardApi } from "@lib/api";
import { dashboardToView, formatRating } from "@lib/api/presenters";
import { formatPrice, formatRelativeTime, formatTime } from "@lib/format";

export default function OwnerDashboardPage() {
  const { restaurant, restaurantLoading } = useOwner();
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await dashboardApi.getDashboardStats();
      setView(dashboardToView(stats));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "تعذر تحميل الإحصائيات، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (restaurantLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OwnerCardSkeleton />
        <OwnerCardSkeleton />
        <OwnerCardSkeleton />
        <OwnerCardSkeleton />
      </div>
    );
  }

  if (!restaurant) {
    return <RestaurantSetupForm />;
  }

  const pendingCount =
    view?.ordersByStatus.find((entry) => entry.status === "PENDING")?.count ?? 0;

  return (
    <div>
      <OwnerPageHeader
        title="نظرة عامة"
        subtitle="أهلاً بيك — هدول أرقامك لهلق"
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

      {!error && loading && !view ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OwnerCardSkeleton />
          <OwnerCardSkeleton />
          <OwnerCardSkeleton />
          <OwnerCardSkeleton />
        </div>
      ) : null}

      {!error && view ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerStatCard
              icon={<ReceiptText className="h-5 w-5" aria-hidden="true" />}
              label="إجمالي الطلبات"
              value={formatStatNumber(view.orders.total)}
              hint={`اليوم ${formatStatNumber(view.orders.today)} · هذا الأسبوع ${formatStatNumber(view.orders.thisWeek)}`}
              href="/owner/orders"
            />
            <OwnerStatCard
              icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
              iconTone="bg-success/15 text-success"
              label="الإيرادات"
              value={formatPrice(view.revenue.total, true)}
              hint={`اليوم ${formatPrice(view.revenue.today, true)}`}
            />
            <OwnerStatCard
              icon={<Star className="h-5 w-5" aria-hidden="true" />}
              iconTone="bg-gold/20 text-clay"
              label="متوسط التقييم"
              value={view.reviews.averageRating ? formatRating(view.reviews.averageRating, true) : "—"}
              hint={`${formatStatNumber(view.reviews.total)} تقييم`}
              href="/owner/reviews"
            />
            <OwnerStatCard
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              iconTone="bg-warning/15 text-warning"
              label="قيد الانتظار"
              value={formatStatNumber(pendingCount)}
              hint="طلبات تنتظر القبول"
              href="/owner/orders"
              highlight={pendingCount > 0}
              cta={pendingCount > 0 ? "روح على الطلبات" : undefined}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-[16px] font-bold text-foreground">
                  آخر الطلبات
                </h2>
                <Link
                  href="/owner/orders"
                  className="inline-flex items-center gap-1 text-[13.5px] font-bold text-primary transition-colors hover:text-primary-dark"
                >
                  كل الطلبات
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {view.recentOrders.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-muted">
                  لسا ما في طلبات — أول طلب رح يظهر هون
                </p>
              ) : (
                <ul className="space-y-2">
                  {view.recentOrders.map((order, index) => (
                    <li key={order.id}>
                      <Link
                        href="/owner/orders"
                        className={`flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          index % 2 === 1 ? "bg-background" : "bg-white"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="min-w-0 truncate font-display text-[14px] font-bold text-foreground">
                              {order.orderNumber}
                            </span>
                            <OrderStatusBadge status={order.statusLabel} />
                          </div>
                          <p className="mt-1 truncate text-[13px] text-muted">
                            {order.customerName} · {order.itemCount} أصناف
                            {order.createdAt ? (
                              <span> · {formatRelativeTime(order.createdAt)}</span>
                            ) : null}
                          </p>
                        </div>
                        <ChevronLeft
                          className="h-4 w-4 shrink-0 text-muted"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 font-display text-[16px] font-bold text-foreground">
                الطلبات حسب الحالة
              </h2>
              {view.ordersByStatus.length === 0 ? (
                <p className="py-6 text-center text-[14px] text-muted">
                  ما في طلبات بعد
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {view.ordersByStatus.map((entry) => (
                    <li
                      key={entry.status}
                      className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3"
                    >
                      <span className="text-[13.5px] font-semibold text-foreground">
                        {entry.label}
                      </span>
                      <span className="font-display text-[15px] font-black text-primary">
                        {formatStatNumber(entry.count)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
