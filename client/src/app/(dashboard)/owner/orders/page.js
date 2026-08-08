"use client";

import Link from "next/link";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DriverAssignModal from "@components/owner/DriverAssignModal";
import OwnerEmptyState from "@components/owner/OwnerEmptyState";
import OwnerOrderCard from "@components/owner/OwnerOrderCard";
import OwnerPageHeader from "@components/owner/OwnerPageHeader";
import RefreshButton from "@components/owner/RefreshButton";
import { OwnerListSkeleton } from "@components/owner/OwnerSkeleton";
import { useOwner } from "@context/OwnerContext";
import { orderApi } from "@lib/api";
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getRestaurantOrders({ page: 1, limit: 50 });
      setOrders((data.orders ?? []).map(orderToOwnerCard));
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
        action={<RefreshButton loading={loading} onClick={load} label="حدّث" />}
      />

      <div
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
