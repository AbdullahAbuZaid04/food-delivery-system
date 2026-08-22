"use client";

import OrderStatusBadge from "@components/orders/OrderStatusBadge";
import { formatPrice, formatRelativeTime } from "@lib/format";
import {
  STATUS_ACTION_LABELS,
  formatOwnerDateTime,
} from "@lib/api/presenters";
import { dangerButtonClass, primaryButtonClass, secondaryButtonClass } from "./OwnerFields";

// OwnerOrderCard — a restaurant-facing order: customer, address, items, totals
// and the legal next-status actions (ASSIGNED opens the driver picker).
export default function OwnerOrderCard({ order, onAction, onAssignDriver, busy }) {
  const {
    id,
    orderNumber,
    statusLabel,
    createdAt,
    customerName,
    customerPhone,
    addressLine,
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    paymentLabel,
    notes,
    driverName,
    driverPhone,
    nextActions,
  } = order;

  const actionClass = (action) => {
    if (action === "CANCELLED") return dangerButtonClass;
    if (action === "ACCEPTED" || nextActions[0] === action) return primaryButtonClass;
    return secondaryButtonClass;
  };

  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <header className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate font-display text-[15px] font-bold text-foreground">
            {orderNumber}
          </p>
          <OrderStatusBadge status={statusLabel} />
        </div>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {formatOwnerDateTime(createdAt)}
          {createdAt ? (
            <span> · {formatRelativeTime(createdAt)}</span>
          ) : null}
        </p>
      </header>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold text-muted">الزبون:</dt>
          <dd className="text-foreground">
            {customerName} {customerPhone ? <span dir="ltr">· {customerPhone}</span> : null}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold text-muted">العنوان:</dt>
          <dd className="text-foreground">{addressLine || "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold text-muted">الدفع:</dt>
          <dd className="text-foreground">{paymentLabel}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold text-muted">الملاحظات:</dt>
          <dd className="text-foreground">{notes || "—"}</dd>
        </div>
        {driverName ? (
          <div className="flex gap-2 sm:col-span-2">
            <dt className="shrink-0 font-bold text-muted">السائق:</dt>
            <dd className="text-foreground">
              {driverName}
              {driverPhone ? <span dir="ltr"> · {driverPhone}</span> : null}
            </dd>
          </div>
        ) : null}
      </dl>

      <ul className="mt-4 space-y-2 rounded-xl bg-background p-4">
        {items.map((item, index) => (
          <li key={`${id}-${index}`} className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-foreground">
              {item.name}
              <span className="mx-1.5 text-muted">×</span>
              <span className="font-bold text-foreground">{item.quantity}</span>
            </span>
            <span className="shrink-0 font-semibold text-foreground">
              {formatPrice((item.unitPrice || 0) * (item.quantity || 0), true)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-1 text-[13px] sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted">
          {itemCount} أصناف · {formatPrice(subtotal, true)} قبل التوصيل
          <span className="mx-1.5">·</span>
          التوصيل {formatPrice(deliveryFee, true)}
        </p>
        <div className="sm:text-end">
          <p className="font-display text-[16px] font-black text-foreground">
            الإجمالي {formatPrice(total, true)}
          </p>
        </div>
      </div>

      {nextActions.length > 0 || order.status === "READY" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {order.status === "READY" ? (
            <button
              type="button"
              onClick={() => onAssignDriver(order)}
              disabled={busy === id}
              className={primaryButtonClass}
            >
              {busy === id ? "بالتعيين…" : "تعيين سائق"}
            </button>
          ) : null}
          {nextActions.map((action) => (
            <button
              key={`${id}-${action}`}
              type="button"
              onClick={() => onAction(id, action)}
              disabled={busy === id}
              className={actionClass(action)}
            >
              {busy === id ? "بالتحديث…" : STATUS_ACTION_LABELS[action]}
            </button>
          ))}
          <span className="text-[12px] text-muted">{statusLabel}</span>
        </div>
      ) : null}
    </article>
  );
}
