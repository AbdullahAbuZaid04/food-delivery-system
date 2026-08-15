"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, MoveHorizontal, PackageOpen, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import RefreshButton from "@components/owner/RefreshButton";
import { useOrderEvents } from "@hooks/useOrderEvents";
import { getMyDriverOrders } from "@lib/api/orders";
import { formatOwnerDateTime, orderToDriverCard } from "@lib/api/presenters";
import { formatPrice, formatTime } from "@lib/format";

const ACTIVE_STATUSES = new Set(["ASSIGNED", "PICKED_UP", "ON_THE_WAY"]);

const DRIVER_TABS = [
  { key: "active", label: "جارية" },
  { key: "completed", label: "مكتملة" },
];

function DriverCard({ order }) {
  const isActive = ACTIVE_STATUSES.has(order.status);
  return (
    <Link
      href={`/driver/orders/${order.id}`}
      className="block rounded-2xl border border-border bg-surface p-4 sm:p-5 transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-bold text-foreground">
            {order.restaurantName}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            رقم الطلب{" "}
            <span dir="ltr" className="inline-block font-semibold">
              {order.orderNumber}
            </span>
          </p>
        </div>
        <OrderStatusBadge status={order.statusLabel} />
      </div>

      <div className="mt-3 space-y-1.5 text-[13.5px]">
        <p className="font-semibold text-foreground">{order.customerName}</p>
        <p className="flex items-start gap-1.5 text-muted">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="min-w-0">{order.addressLine}</span>
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[13px] text-muted">
          {order.itemCount} صنف · {formatPrice(order.total, true)}
        </span>
        {order.nextActionLabel ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-primary">
            {order.nextActionLabel}
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default function DriverOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("active");
  const [lastUpdated, setLastUpdated] = useState(null);
  const tabsRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);

  // The pill tabs scroll horizontally if they ever overflow; show the swipe
  // hint only when that's actually the case.
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => {
      setTabsOverflow(el.scrollWidth > el.clientWidth + 4);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getMyDriverOrders({ limit: 100 });
      setOrders((data?.orders ?? []).map(orderToDriverCard));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "تعذر تحميل الطلبات، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const activeOrders = orders.filter((order) => ACTIVE_STATUSES.has(order.status));
  const completedOrders = orders.filter((order) => !ACTIVE_STATUSES.has(order.status));
  const visibleOrders = tab === "active" ? activeOrders : completedOrders;

  // Live refresh: a new assignment or a status change re-fetches silently.
  useOrderEvents(() => load({ silent: true }));

  return (
    <div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h1 className="font-display text-[22px] font-black text-foreground">
            طلباتي
          </h1>
          <div className="flex items-center gap-3">
            {lastUpdated ? (
              <span className="text-[12px] text-muted">
                آخر تحديث {formatTime(lastUpdated.toISOString(), true)}
              </span>
            ) : null}
            <RefreshButton loading={loading} onClick={load} label="حدّث" />
          </div>
        </div>
        <p className="mt-1 text-[13.5px] text-muted">
          تابع توصيلاتك الجارية وبلّغ وصول كل طلبية.
        </p>
      </div>

      <div
        ref={tabsRef}
        role="tablist"
        aria-label="تصفية الطلبات"
        className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-1"
      >
        {DRIVER_TABS.map((t) => {
          const active = tab === t.key;
          const count =
            t.key === "active" ? activeOrders.length : completedOrders.length;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                active
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${
                  active ? "bg-white/20 text-white" : "bg-muted/10 text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tabsOverflow ? (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] leading-none text-muted">
          <MoveHorizontal
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          اسحب يمين ويسار لشوف باقي التبويبات
        </p>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-display font-bold text-foreground">
            صارت مشكلة في تحميل الطلبات
          </p>
          <p className="mt-1 text-[13.5px] text-muted">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            حاول مرة تانية
          </button>
        </div>
      ) : null}

      {!error && loading && orders.length === 0 ? (
        <div className="mt-6 space-y-3" role="status">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
            />
          ))}
          <span className="sr-only">عم نقرا الطلبات…</span>
        </div>
      ) : null}

      {!error && !loading && visibleOrders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <PackageOpen className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display font-bold text-foreground">
            {tab === "active" ? "ما في طلبات جارية" : "ما في طلبات مكتملة"}
          </p>
          <p className="mt-1 text-[13.5px] text-muted">
            {tab === "active"
              ? "لما يعلّقلك مطعم طلبية، رح تظهر هون."
              : "لما تخلّص أول توصيل، رح يظهر هون."}
          </p>
        </div>
      ) : null}

      {!error && !loading && visibleOrders.length > 0 ? (
        <div className="mt-6 space-y-3">
          {visibleOrders.map((order) => (
            <DriverCard key={order.id} order={order} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
