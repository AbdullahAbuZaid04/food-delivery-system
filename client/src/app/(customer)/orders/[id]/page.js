"use client";

import { use, useCallback, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import AppHeader from "@components/customer/AppHeader";
import OrderTrackingView from "@components/orders/OrderTrackingView";
import { cancelOrder, getOrderById } from "@lib/api/orders";
import { createReview } from "@lib/api/reviews";
import { orderToTracking } from "@lib/api/presenters";
import { useAuth } from "@context/AuthContext";
import { useOrderEvents } from "@hooks/useOrderEvents";

function TrackingLoading({ userName }) {
  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />
      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
        <div className="mt-10 md:mt-12 min-h-[320px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-clay/25 bg-cream-deep/60 px-6 py-14 text-center">
          <span className="w-14 h-14 rounded-full bg-terra/10 flex items-center justify-center">
            <Loader2
              className="w-7 h-7 text-terra animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          </span>
          <p
            role="status"
            className="mt-4 font-display font-semibold text-[15px] text-cocoa"
          >
            عم نقرا تفاصيل طلبك…
          </p>
        </div>
      </main>
    </div>
  );
}

function TrackingError({ userName, message, onRetry }) {
  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={userName} showSearch={false} />
      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-16">
        <div className="mt-10 md:mt-12 rounded-[24px] border border-clay/10 bg-cream-deep p-8 text-center">
          <p className="font-display font-bold text-lg text-cocoa">
            صارت مشكلة في تحميل الطلب
          </p>
          <p className="text-cocoa-soft text-[14px] mt-2">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 h-11 px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            أعد المحاولة
          </button>
        </div>
      </main>
    </div>
  );
}

export default function OrderTrackingPage({ params }) {
  const { id } = use(params);
  const { user, status } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setIsNotFound(false);
    try {
      const detail = await getOrderById(id);
      if (!detail) {
        setIsNotFound(true);
        return;
      }
      setOrder(orderToTracking(detail));
    } catch (err) {
      if (err?.status === 404) {
        setIsNotFound(true);
      } else {
        setError(err?.message || "صارت مشكلة في تحميل الطلب");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status === "authenticated") loadOrder();
  }, [status, loadOrder]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Live updates for this order: refetch when an event names it, so the
  // timeline advances without a manual refresh.
  useOrderEvents(
    useCallback(
      (event) => {
        if (event.orderId === id) loadOrder();
      },
      [id, loadOrder],
    ),
  );

  const handleCancel = useCallback(async () => {
    await cancelOrder(id);
    toast.success("أُلغي طلبك");
    await loadOrder();
  }, [id, loadOrder]);

  const handleReview = useCallback(
    async (rating, comment) => {
      await createReview(id, { rating, comment });
      toast.success("تم إرسال تقييمك، شكرًا!");
      await loadOrder();
    },
    [id, loadOrder],
  );

  if (status === "loading") {
    return <TrackingLoading userName="" />;
  }

  if (isNotFound) notFound();

  if (isLoading) return <TrackingLoading userName={userName} />;
  if (error) {
    return (
      <TrackingError
        userName={userName}
        message={error}
        onRetry={() => loadOrder()}
      />
    );
  }

  return (
    <OrderTrackingView
      order={order}
      userName={userName}
      onCancel={handleCancel}
      onReview={handleReview}
    />
  );
}
