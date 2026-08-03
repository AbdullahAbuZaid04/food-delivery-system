// src/app/(customer)/orders/page.js
// "طلباتي" — UI-only order-history screen with local filtering (no real API,
// mock data from @lib/mock/orders.js). "use client" because filtering is done
// in-browser with local state + useMemo.
"use client";

import { useMemo, useState } from "react";
import AppHeader from "@components/customer/AppHeader";
import BottomNav from "@components/customer/BottomNav";
import CategoryFilterBar from "@components/customer/CategoryFilterBar";
import EmptyState from "@components/customer/EmptyState";
import OrderHistoryCard from "@components/orders/OrderHistoryCard";
import { orders } from "@lib/mock/orders";
import { toArabicDigits } from "@lib/format";

const MOCK_USER_NAME = "أحمد";

const ORDER_TABS = ["الكل", "جارية", "سابقة"];

const STATUSES_BY_TAB = {
  "الكل": [],
  "جارية": ["قيد التحضير", "بالطريق"],
  "سابقة": ["تم التوصيل", "ملغي"],
};

function OrdersPage() {
  const [activeTab, setActiveTab] = useState("الكل");

  const visibleOrders = useMemo(() => {
    const statuses = STATUSES_BY_TAB[activeTab];
    const filtered =
      statuses.length === 0
        ? orders
        : orders.filter((order) => statuses.includes(order.status));
    return [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTab]);

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={MOCK_USER_NAME} showSearch={false} />

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
          {visibleOrders.length === 1
            ? "عندك طلب واحد بهالتصنيف"
            : visibleOrders.length === 2
              ? "عندك طلبين بهالتصنيف"
              : `عندك ${toArabicDigits(visibleOrders.length)} طلبات بهالتصنيف`}
        </p>

        {visibleOrders.length > 0 ? (
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
