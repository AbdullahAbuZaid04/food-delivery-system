"use client";

import Link from "next/link";
import { use } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ChefHat,
  ChevronRight,
  CircleDot,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  Store,
  User,
} from "lucide-react";
import AdminStatusSelect from "@components/admin/AdminStatusSelect";
import ConfirmStatusModal from "@components/admin/ConfirmStatusModal";
import { getRestaurantById, updateRestaurantStatus } from "@lib/api/admin";
import {
  adminRestaurantStatusLabel,
  adminRestaurantStatusOptions,
  adminRestaurantToDetail,
  formatOwnerDateTime,
} from "@lib/api/presenters";

export default function AdminRestaurantDetailPage({ params }) {
  const { id } = use(params);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const loadRestaurant = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const detail = await getRestaurantById(id);
      setRestaurant(adminRestaurantToDetail(detail));
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل المطعم.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRestaurant();
  }, [loadRestaurant]);

  const applyStatus = useCallback(
    async (status) => {
      if (!restaurant || status === restaurant.status) return;
      setBusy(true);
      setConfirmOpen(false);
      setPendingStatus(null);
      try {
        await updateRestaurantStatus(restaurant.id, status);
        toast.success(`تم تحديث حالة ${restaurant.name}`);
        await loadRestaurant();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusy(false);
      }
    },
    [restaurant, loadRestaurant],
  );

  const handleRequestChange = (status) => {
    if (status === restaurant.status) return;
    if (status === "SUSPENDED" || status === "REJECTED") {
      setPendingStatus(status);
      setConfirmOpen(true);
      return;
    }
    applyStatus(status);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Loader2
            className="h-7 w-7 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
        </span>
        <p role="status" className="mt-4 font-display font-semibold text-foreground">
          عم نقرا بيانات المطعم…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display font-bold text-foreground">
          صارت مشكلة في تحميل المطعم
        </p>
        <p className="mt-1 text-[13.5px] text-muted">{error}</p>
        <button
          type="button"
          onClick={loadRestaurant}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          حاول مرة تانية
        </button>
      </div>
    );
  }

  const countItems = [
    { label: "أصناف", value: restaurant.counts.meals, icon: ChefHat },
    { label: "تصنيفات", value: restaurant.counts.categories, icon: Store },
    { label: "طلبات", value: restaurant.counts.orders, icon: ShoppingBag },
    { label: "تقييمات", value: restaurant.counts.reviews, icon: MessageSquareText },
  ];

  return (
    <div>
      <Link
        href="/admin/restaurants"
        className="inline-flex h-11 items-center gap-1 text-[14px] font-bold text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        كل المطاعم
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-black text-foreground">
              {restaurant.name}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-muted">
              {restaurant.cuisine
                ? `${restaurant.cuisine} · `
                : ""}
              انضم {formatOwnerDateTime(restaurant.createdAt)}
            </p>
          </div>
        </div>

        <AdminStatusSelect
          value={restaurant.status}
          statuses={adminRestaurantStatusOptions(restaurant.status)}
          labelFor={adminRestaurantStatusLabel}
          onRequestChange={handleRequestChange}
          disabled={busy}
        />
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {countItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-xl font-black text-foreground">
                {item.value}
              </p>
              <p className="mt-0.5 text-[12.5px] font-semibold text-muted">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="restaurant-info-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="restaurant-info-title"
            className="font-display font-bold text-foreground"
          >
            معلومات المطعم
          </h2>
          <dl className="mt-3 space-y-2.5 text-[13.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex shrink-0 items-center gap-1.5 text-muted">
                <CircleDot className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                الحالة
              </dt>
              <dd className="font-semibold text-foreground">
                {restaurant.statusLabel}
              </dd>
            </div>
            {restaurant.addressLine ? (
              <div className="flex items-start justify-between gap-3">
                <dt className="flex shrink-0 items-center gap-1.5 text-muted">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  العنوان
                </dt>
                <dd className="font-semibold text-foreground">
                  <span dir="rtl">{restaurant.addressLine}</span>
                </dd>
              </div>
            ) : null}
            {restaurant.phone ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex shrink-0 items-center gap-1.5 text-muted">
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  الهاتف
                </dt>
                <dd className="font-semibold text-foreground">
                  <span dir="ltr">{restaurant.phone}</span>
                </dd>
              </div>
            ) : null}
            {restaurant.email ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex shrink-0 items-center gap-1.5 text-muted">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  البريد
                </dt>
                <dd className="font-semibold text-foreground">
                  <span dir="ltr">{restaurant.email}</span>
                </dd>
              </div>
            ) : null}
            {restaurant.estimatedDeliveryTime ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="flex shrink-0 items-center gap-1.5 text-muted">
                  <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  وقت التوصيل التقديري
                </dt>
                <dd className="font-semibold text-foreground">
                  {restaurant.estimatedDeliveryTime} دقيقة
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section
          aria-labelledby="restaurant-owner-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="restaurant-owner-title"
            className="font-display font-bold text-foreground"
          >
            المالك
          </h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-bold text-foreground">
                  {restaurant.ownerName}
                </p>
                {restaurant.ownerEmail ? (
                  <p className="truncate text-[12.5px] text-muted">
                    {restaurant.ownerEmail}
                  </p>
                ) : null}
              </div>
            </div>
            {restaurant.ownerId ? (
              <Link
                href={`/admin/users/${restaurant.ownerId}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                عرض حساب المالك
              </Link>
            ) : null}
          </div>
        </section>
      </div>

      {restaurant.status === "SUSPENDED" ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-error/25 bg-error/10 px-4 py-3.5 text-[14px] font-bold text-error">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
          هالمطعم معلّق وما بيظهر للزبائن.
        </p>
      ) : null}

      {restaurant.status === "PENDING" ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3.5 text-[14px] font-bold text-warning">
          <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
          هالمطعم جديد عم يستنى قرارك — افحص بياناته وبعدين اقبله أو ارفضه.
        </p>
      ) : null}

      {restaurant.status === "REJECTED" ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-error/25 bg-error/10 px-4 py-3.5 text-[14px] font-bold text-error">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
          هالمطعم مرفوض — ما بيظهر للزبائن، وبقدّر المالك يعيد طلب المراجعة.
        </p>
      ) : null}

      <ConfirmStatusModal
        open={confirmOpen}
        title={pendingStatus === "REJECTED" ? "رفض المطعم" : "تعليق المطعم"}
        message={
          pendingStatus === "REJECTED"
            ? `هل أنت متأكد من رفض ${restaurant.name}؟ رح يظهر للمالك إنه مرفوض، وما رح يشتغل على المنصة.`
            : `هل أنت متأكد من تعليق ${restaurant.name}؟ بعد التعليق ما رح يظهر المطعم للزبائن ولا بيقدر يستقبل طلبات.`
        }
        confirmLabel={pendingStatus === "REJECTED" ? "ارفض المطعم" : "علّق المطعم"}
        busy={busy}
        onConfirm={() => pendingStatus && applyStatus(pendingStatus)}
        onClose={() => {
          setConfirmOpen(false);
          setPendingStatus(null);
        }}
      />
    </div>
  );
}
