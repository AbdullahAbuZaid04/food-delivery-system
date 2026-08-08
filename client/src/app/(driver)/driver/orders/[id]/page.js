"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ChevronRight,
  Loader2,
  MapPin,
  PackageOpen,
  Phone,
  RefreshCw,
} from "lucide-react";
import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import { getOrderById, updateDriverOrderStatus } from "@lib/api/orders";
import { formatOwnerDateTime, orderToDriverCard } from "@lib/api/presenters";
import { formatPrice } from "@lib/format";

function Loading({ label }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Loader2
          className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none"
          aria-hidden="true"
        />
      </span>
      <p
        role="status"
        className="mt-4 font-display font-semibold text-foreground"
      >
        {label}
      </p>
    </div>
  );
}

export default function DriverOrderDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const detail = await getOrderById(id);
      setOrder(orderToDriverCard(detail));
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل الطلب.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrder();
  }, [loadOrder]);

  const advance = useCallback(async () => {
    if (!order?.nextAction) return;
    setBusy(true);
    try {
      await updateDriverOrderStatus(order.id, order.nextAction);
      toast.success(order.nextActionLabel);
      await loadOrder();
    } catch (err) {
      toast.error(err?.message || "صارت مشكلة في تحديث الحالة.");
    } finally {
      setBusy(false);
    }
  }, [order, loadOrder]);

  if (isLoading) return <Loading label="عم نقرا تفاصيل الطلب…" />;

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display font-bold text-foreground">
          صارت مشكلة في تحميل الطلب
        </p>
        <p className="mt-1 text-[13.5px] text-muted">{error}</p>
        <button
          type="button"
          onClick={loadOrder}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          حاول مرة تانية
        </button>
      </div>
    );
  }

  const subtotal = (order.items ?? []).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <div>
      <Link
        href="/driver"
        className="inline-flex h-11 items-center gap-1 text-[14px] font-bold text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        كل الطلبات
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-black text-foreground">
            {console.log(order)}
            {order.restaurantName}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            رقم الطلب{" "}
            <span dir="ltr" className="inline-block font-semibold">
              {order.orderNumber}
            </span>
            {" · "}
            {formatOwnerDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.statusLabel} />
      </header>

      <div className="mt-6 space-y-4">
        <section
          aria-labelledby="delivery-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="delivery-title"
                className="font-display font-bold text-foreground"
              >
                {order.customerName}
              </h2>
              <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] text-muted">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>{order.addressLine}</span>
              </p>
              <p className="mt-1.5 text-[13.5px] text-muted">
                الدفع: {order.paymentLabel}
              </p>
            </div>

            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label={`اتصال بالزبون ${order.customerName}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              اتصل بالزبون
            </a>
          </div>
        </section>

        <section
          aria-labelledby="items-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="items-title"
            className="font-display font-bold text-foreground"
          >
            محتوى الطلبية
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="min-w-0 text-[14px] text-foreground">
                  {item.name}{" "}
                  <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="shrink-0 text-[14px] font-bold text-foreground">
                  {formatPrice(item.unitPrice * item.quantity, true)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t border-border pt-3 text-[13.5px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted">المجموع الفرعي</dt>
              <dd className="font-semibold text-foreground">
                {formatPrice(subtotal, true)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">توصيل</dt>
              <dd className="font-semibold text-foreground">
                {formatPrice(order.deliveryFee, true)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-[14.5px]">
              <dt className="font-bold text-foreground">الإجمالي</dt>
              <dd className="font-bold text-primary">
                {formatPrice(order.total, true)}
              </dd>
            </div>
          </dl>
          {order.notes ? (
            <p className="mt-3 rounded-xl bg-muted/10 px-3 py-2.5 text-[13px] text-muted">
              ملاحظة الزبون: {order.notes}
            </p>
          ) : null}
        </section>

        {order.nextAction ? (
          <button
            type="button"
            onClick={advance}
            disabled={busy}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-bold text-white shadow-[0_12px_28px_-10px_rgba(184,74,38,0.6)] transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
          >
            {busy ? "عم نحدّث…" : order.nextActionLabel}
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-success/25 bg-success/10 px-4 py-3.5 text-[14px] font-bold text-success">
            <PackageOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
            هالطلبية مخلّصة — يعطيك ألف عافية!
          </div>
        )}
      </div>
    </div>
  );
}
