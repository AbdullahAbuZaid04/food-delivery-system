"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  MoveHorizontal,
  Search,
  Store,
  User,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import AdminStatusSelect from "@components/admin/AdminStatusSelect";
import ConfirmStatusModal from "@components/admin/ConfirmStatusModal";
import { restaurantStatusBadge } from "@components/admin/AdminBadges";
import RefreshButton from "@components/owner/RefreshButton";
import { getRestaurants, updateRestaurantStatus } from "@lib/api/admin";
import {
  adminRestaurantStatusLabel,
  adminRestaurantStatusOptions,
  adminRestaurantToCard,
  formatOwnerTime,
} from "@lib/api/presenters";

const STATUS_FILTERS = [
  { value: null, label: "الكل" },
  { value: "PENDING", label: "قيد المراجعة" },
  { value: "OPEN", label: "مفتوح" },
  { value: "CLOSED", label: "مغلق" },
  { value: "SUSPENDED", label: "معلّق" },
  { value: "REJECTED", label: "مرفوض" },
];

function RestaurantsScreen() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || null,
  );
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [pending, setPending] = useState(null); // { restaurant, status }
  const [lastUpdated, setLastUpdated] = useState(null);
  const tabsRef = useRef(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);

  // The status pills scroll horizontally on any screen where they overflow;
  // show the swipe hint only when that's actually the case.
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const check = () => {
      setTabsOverflow(el.scrollWidth > el.clientWidth + 4);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [loading]);

  // Keep the selected tab in view when it changes (banner shortcut, URL param,
  // manual tap on a scrolled-out pill).
  useEffect(() => {
    tabsRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [statusFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurants({ limit: 100 });
      setRestaurants(data.map(adminRestaurantToCard));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "تعذر تحميل المطاعم، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const applyStatus = useCallback(
    async (restaurant, status) => {
      setBusyId(restaurant.id);
      setPending(null);
      try {
        await updateRestaurantStatus(restaurant.id, status);
        toast.success(`تم تحديث حالة ${restaurant.name}`);
        await load();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const handleRequestChange = (restaurant, status) => {
    if (status === restaurant.status) return;
    if (status === "SUSPENDED" || status === "REJECTED") {
      setPending({ restaurant, status });
      return;
    }
    applyStatus(restaurant, status);
  };

  const query = search.trim().toLowerCase();
  const visibleRestaurants = restaurants.filter((restaurant) => {
    if (statusFilter && restaurant.status !== statusFilter) return false;
    if (!query) return true;
    return [restaurant.name, restaurant.cuisine, restaurant.ownerName]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const pendingCount = restaurants.filter(
    (restaurant) => restaurant.status === "PENDING",
  ).length;

  const countFor = (status) =>
    status
      ? restaurants.filter((restaurant) => restaurant.status === status).length
      : restaurants.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div>
          <h1 className="font-display text-[22px] font-black text-foreground">
            المطاعم
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {restaurants.length} مطعم على المنصة
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated ? (
            <span className="text-[12px] text-muted">
              آخر تحديث {formatOwnerTime(lastUpdated.toISOString())}
            </span>
          ) : null}
          <RefreshButton loading={loading} onClick={load} label="حدّث" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث باسم المطعم أو المطبخ أو المالك…"
            aria-label="البحث في المطاعم"
            className="h-12 w-full rounded-xl border border-border bg-white ps-12 pe-4 text-[13.5px] font-semibold text-foreground placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="تصفية المطاعم حسب الحالة"
          className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1"
        >
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.value;
            return (
              <button
                key={filter.value ?? "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(filter.value)}
                className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active
                    ? "border border-primary bg-primary text-white shadow-sm"
                    : "border border-border bg-surface text-muted hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-black ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-muted/10 text-muted"
                  }`}
                >
                  {countFor(filter.value)}
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
      </div>

      {pendingCount > 0 && statusFilter !== "PENDING" ? (
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3.5 text-start transition-colors hover:bg-warning/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="flex items-center gap-2 text-[14px] font-bold text-warning">
            <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
            عندك {pendingCount} {pendingCount === 1 ? "مطعم" : "مطاعم"} قيد المراجعة — افحصهم هلق
          </span>
          <ChevronLeft className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        </button>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-display font-bold text-foreground">
            صارت مشكلة في تحميل المطاعم
          </p>
          <p className="mt-1 text-[13.5px] text-muted">{error}</p>
          <button
            type="button"
            onClick={load}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            حاول مرة تانية
          </button>
        </div>
      ) : null}

      {!error && loading ? (
        <div className="mt-6 space-y-3" role="status">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
            />
          ))}
          <span className="sr-only">عم نقرا المطاعم…</span>
        </div>
      ) : null}

      {!error && !loading && visibleRestaurants.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display font-bold text-foreground">
            ما في مطاعم بهالتصفية
          </p>
        </div>
      ) : null}

      {!error && !loading && visibleRestaurants.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <ul>
            {visibleRestaurants.map((restaurant) => (
              <li
                key={restaurant.id}
                className="flex flex-col gap-3 p-4 odd:bg-white/40 transition-colors hover:bg-muted/5 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <Link
                  href={`/admin/restaurants/${restaurant.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm ring-1 ring-primary/10">
                    <Store className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[15px] font-bold text-foreground transition-colors group-hover:text-primary">
                        {restaurant.name}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {restaurant.cuisine ? (
                          <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary-dark">
                            {restaurant.cuisine}
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${restaurantStatusBadge(restaurant.status)}`}
                        >
                          {restaurant.statusLabel}
                        </span>
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">
                      <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{restaurant.ownerName}</span>
                    </span>
                  </span>
                </Link>

                <div className="flex items-center justify-end gap-3">
                  <AdminStatusSelect
                    value={restaurant.status}
                    statuses={adminRestaurantStatusOptions(restaurant.status)}
                    labelFor={adminRestaurantStatusLabel}
                    onRequestChange={(status) =>
                      handleRequestChange(restaurant, status)
                    }
                    disabled={busyId === restaurant.id}
                  />
                  <Link
                    href={`/admin/restaurants/${restaurant.id}`}
                    aria-label={`تفاصيل ${restaurant.name}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ConfirmStatusModal
        open={Boolean(pending)}
        title={pending?.status === "REJECTED" ? "رفض المطعم" : "تعليق المطعم"}
        message={
          pending
            ? pending.status === "REJECTED"
              ? `هل أنت متأكد من رفض ${pending.restaurant.name}؟ رح يظهر للمالك إنه مرفوض، وما رح يشتغل على المنصة.`
              : `هل أنت متأكد من تعليق ${pending.restaurant.name}؟ بعد التعليق ما رح يظهر المطعم للزبائن ولا بيقدر يستقبل طلبات.`
            : ""
        }
        confirmLabel={pending?.status === "REJECTED" ? "ارفض المطعم" : "علّق المطعم"}
        busy={Boolean(pending && busyId === pending.restaurant.id)}
        onConfirm={() =>
          pending && applyStatus(pending.restaurant, pending.status)
        }
        onClose={() => setPending(null)}
      />
    </div>
  );
}

export default function AdminRestaurantsPage() {
  return (
    <Suspense fallback={null}>
      <RestaurantsScreen />
    </Suspense>
  );
}
