"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import BottomNav from "@components/customer/BottomNav";
import CategoryFilterBar from "@components/customer/CategoryFilterBar";
import EmptyState from "@components/customer/EmptyState";
import OrderHistoryCard from "@components/orders/OrderHistoryCard";
import { getMyOrders } from "@lib/api/orders";
import { orderToHistoryCard } from "@lib/api/presenters";
import { useAuth } from "@context/AuthContext";
import { toArabicDigits } from "@lib/format";

const ORDER_TABS = ["الكل", "جارية", "سابقة"];

const STATUSES_BY_TAB = {
  "الكل": [],
  "جارية": ["قيد التحضير", "بالطريق"],
  "سابقة": ["تم التوصيل", "ملغي"],
};

function OrdersLoading() {
  return (
    <section aria-busy="true" aria-label="جاري تحميل طلباتك">
      <div className="mt-6 md:mt-8 space-y-3 sm:space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-[24px] bg-clay/10 animate-pulse motion-reduce:animate-none"
          />
        ))}
      </div>
    </section>
  );
}

function OrdersPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("الكل");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getMyOrders();
      setOrders(Array.isArray(result) ? result : (result?.orders ?? []));
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل طلباتك");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status === "authenticated") fetchOrders();
  }, [status, fetchOrders]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const visibleOrders = useMemo(() => {
    const statuses = STATUSES_BY_TAB[activeTab];
    const mapped = orders.map(orderToHistoryCard);
    const filtered =
      statuses.length === 0
        ? mapped
        : mapped.filter((order) => statuses.includes(order.status));
    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTab, orders]);

  const userName = user?.firstName ?? "";

  if (status === "loading") {
    return (
      <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
        <AppHeader userName="" showSearch={false} />
        <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
          <OrdersLoading />
        </main>
        <BottomNav activeKey="orders" />
      </div>
    );
  }

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <header>
          <h1 className="font-display font-black text-[clamp(24px,3vw,32px)] text-cocoa">
            طلباتي
          </h1>
          <p className="mt-1 text-cocoa-soft text-[14px]">
            كل طلباتك من مطاعم غزة بمكان وحدة — وحالة كل طلب بالآخر.
          </p>
        </header>

        <CategoryFilterBar
          categories={ORDER_TABS}
          activeCategory={activeTab}
          onSelect={setActiveTab}
          srOnlyTitle="تصنيفات طلباتك"
          ariaLabel="فلترة الطلبات حسب الحالة"
        />

        <p className="sr-only" role="status">
          {isLoading
            ? "عم نحمّل طلباتك"
            : visibleOrders.length === 1
              ? "عندك طلب واحد بهالتصنيف"
              : visibleOrders.length === 2
                ? "عندك طلبين بهالتصنيف"
                : `عندك ${toArabicDigits(visibleOrders.length)} طلبات بهالتصنيف`}
        </p>

        {isLoading ? (
          <OrdersLoading />
        ) : error ? (
          <div
            role="alert"
            className="mt-8 rounded-[24px] border border-clay/10 bg-cream-deep p-8 text-center"
          >
            <p className="font-display font-bold text-lg text-cocoa">
              صارت مشكلة في تحميل طلباتك
            </p>
            <p className="text-cocoa-soft text-[14px] mt-2">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="mt-5 h-11 px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            >
              أعد المحاولة
            </button>
          </div>
        ) : visibleOrders.length > 0 ? (
          <ul className="mt-6 md:mt-8 space-y-3 sm:space-y-4">
            {visibleOrders.map((order) => (
              <li key={order.id}>
                <OrderHistoryCard order={order} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            onClearFilters={() => setActiveTab("الكل")}
            title="ما في طلبات بهالتصنيف"
            description="ما لقينا ولا طلب بهالتصنيف هلأ. ارجع عالكل عشان تشوف سجلّ طلباتك كامل."
            actionLabel="اعرض كل الطلبات"
          />
        )}
      </main>

      <BottomNav activeKey="orders" />
    </div>
  );
}

export default OrdersPage;
