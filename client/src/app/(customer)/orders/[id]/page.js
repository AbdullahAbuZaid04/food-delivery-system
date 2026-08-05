// src/app/(customer)/orders/[id]/page.js
// Per-order tracking screen — UI-only snapshot of ONE order, no real-time updates
// (AGENTS.md §11). Server Component: no "use client" because nothing here needs
// hooks/browser APIs this phase.
//
// Two sources, one shared layout (components/orders/OrderTrackingView.jsx):
//  - a known mock id → render the static mock order directly;
//  - any other id (e.g. an order placed in this session, persisted under
//    wajba-last-order by the checkout screen) → <LastOrderTracking/>, a client
//    component that reads localStorage and either renders the same view or
//    notFound() — keeping the unknown-id behavior identical to before.
import OrderTrackingView from "@components/orders/OrderTrackingView";
import LastOrderTracking from "@components/orders/LastOrderTracking";
import { orders } from "@lib/mock/orders";

export function generateMetadata() {
  return {
    title: "وجبة | تتبع الطلب",
    description:
      "تابع تفاصيل طلبك خطوة بخطوة — من التأكيد للتحضير ولحد وصول الطلب لباب بيتك.",
  };
}

export function generateStaticParams() {
  return orders.map((order) => ({ id: order.id }));
}

export default async function OrderTrackingPage({ params }) {
  const { id } = await params;
  const order = orders.find((item) => item.id === id);

  if (order) {
    return <OrderTrackingView order={order} />;
  }

  return <LastOrderTracking id={id} />;
}
