"use client";

import Link from "next/link";
import { ClipboardList, MoveHorizontal, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import DriverAssignModal from "@components/owner/DriverAssignModal";
import OwnerEmptyState from "@components/owner/OwnerEmptyState";
import OwnerOrderCard from "@components/owner/OwnerOrderCard";
import OwnerPageHeader from "@components/owner/OwnerPageHeader";
import RefreshButton from "@components/owner/RefreshButton";
import { OwnerListSkeleton } from "@components/owner/OwnerSkeleton";
import { useOwner } from "@context/OwnerContext";
import { useOrderEvents } from "@hooks/useOrderEvents";
import { orderApi } from "@lib/api";
import { formatTime } from "@lib/format";
import {
  OWNER_STATUS_LABELS,
  orderToOwnerCard,
} from "@lib/api/presenters";

const STATUS_TABS = [
  { key: "ALL", label: "الكل" },
  ...Object.entries(OWNER_STATUS_LABELS).map(([status, label]) => ({
    key: status,
    label,
  })),
];

export default function OwnerOrdersPage() {
  const { restaurant, restaurantLoading } = useOwner();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [busyId, setBusyId] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const tabsRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);

  // The status tabs scroll horizontally on any screen where they overflow;
  // show the swipe hint whenever that's actually the case. Runs again once the
  // restaurant loads, because the tablist isn't in the DOM during the skeleton.
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => {
      setTabsOverflow(el.scrollWidth > el.clientWidth + 4);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [restaurant]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getRestaurantOrders({ page: 1, limit: 50 });
      setOrders((data.orders ?? []).map(orderToOwnerCard));
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

  // Live refresh: whenever an order event arrives (new order, status change,
  // driver assigned/cancelled) re-fetch instead of waiting for manual refresh.
  // A brand-new order also surfaces a toast so the owner can't miss it.
  const handleOrderEvent = useCallback(
    (event) => {
      if (event?.type === "ORDER_CREATED") {
        toast.success("في طلب جديد واصل — روح شيك عليه");
      }
      load();
    },
    [load],
  );

  useOrderEvents(handleOrderEvent);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders],
  );

  const visibleOrders = useMemo(
    () =>
      filter === "ALL"
        ? orders
        : orders.filter((order) => order.status === filter),
    [orders, filter],
  );

  const handleAction = async (orderId, status) => {
    setBusyId(orderId);
    try {
      await orderApi.updateOrderStatus(orderId, status);
      toast.success(status === "CANCELLED" ? "تم إلغاء الطلب" : "تم تحديث حالة الطلب");
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر تحديث حالة الطلب.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAssign = async (driverId) => {
    const orderId = assignOrder.id;
    setBusyId(orderId);
    try {
      await orderApi.assignDriver(orderId, driverId);
      toast.success("تم تعيين السائق");
      setAssignOrder(null);
      await load();
    } catch (err) {
      toast.error(err.message || "تعذر تعيين السائق.");
    } finally {
      setBusyId(null);
    }
  };

  if (restaurantLoading) {
    return <OwnerListSkeleton rows={4} />;
  }

  if (!restaurant) {
    return (
      <OwnerEmptyState
        icon={<ClipboardList className="h-6 w-6" aria-hidden="true" />}
        title="عمّر مطعمك الأول"
        description="لما تعمّر مطعمك، طلبات الزبائن رح تظهر هون وتقدّر تديرها من هالمكان."
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
        title="الطلبات"
        subtitle="قدّم، اقبل، جهّز، وعيّن سائق — كل شي من هون"
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

      <div
        ref={tabsRef}
        role="tablist"
        aria-label="تصفية الطلبات حسب الحالة"
        className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1"
      >
        {STATUS_TABS.map((tab) => {
          const active = filter === tab.key;
          const count =
            tab.key === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === tab.key).length;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                active
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
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
        <p className="mb-4 flex items-center gap-1.5 text-[12px] leading-none text-muted">
          <MoveHorizontal
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          اسحب يمين ويسار لشوف باقي الحالات
        </p>
      ) : null}

      {pendingCount > 0 && filter !== "PENDING" ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/5 px-4 py-3">
          <p className="text-[13.5px] font-bold text-foreground">
            في {pendingCount}{" "}
            {pendingCount === 1 ? "طلب" : pendingCount === 2 ? "طلبين" : "طلبات"}{" "}
            بانتظار قبولك
          </p>
          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-[13px] font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            روح عليهم
          </button>
        </div>
      ) : null}

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

      {!error && loading && orders.length === 0 ? (
        <OwnerListSkeleton rows={4} />
      ) : null}

      {!error && !loading && visibleOrders.length === 0 ? (
        <OwnerEmptyState
          icon={<ClipboardList className="h-6 w-6" aria-hidden="true" />}
          title={
            filter === "ALL" ? "ما في طلبات بعد" : `ما في طلبات «${STATUS_TABS.find((tab) => tab.key === filter)?.label}»`
          }
          description={
            filter === "ALL"
              ? "لما أول زبون يطلب من مطعمك، الطلب رح يظهر هون فوراً."
              : "جرّب تصفّي حالة تانية أو رجّع للكل."
          }
        />
      ) : null}

      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <OwnerOrderCard
            key={order.id}
            order={order}
            busy={busyId}
            onAction={handleAction}
            onAssignDriver={(selected) => setAssignOrder(selected)}
          />
        ))}
      </div>

      <DriverAssignModal
        order={assignOrder}
        busy={busyId === assignOrder?.id}
        onClose={() => setAssignOrder(null)}
        onConfirm={handleAssign}
      />
    </div>
  );
}
