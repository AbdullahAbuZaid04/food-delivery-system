"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Store } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminStatusSelect from "@components/admin/AdminStatusSelect";
import ConfirmStatusModal from "@components/admin/ConfirmStatusModal";
import RefreshButton from "@components/owner/RefreshButton";
import { getRestaurants, updateRestaurantStatus } from "@lib/api/admin";
import {
  adminRestaurantStatusLabel,
  adminRestaurantToCard,
} from "@lib/api/presenters";

const RESTAURANT_STATUSES = ["OPEN", "CLOSED", "SUSPENDED"];
const STATUS_FILTERS = [
  { value: null, label: "الكل" },
  { value: "OPEN", label: "مفتوح" },
  { value: "CLOSED", label: "مغلق" },
  { value: "SUSPENDED", label: "معلّق" },
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRestaurants({ limit: 100 });
      setRestaurants(data.map(adminRestaurantToCard));
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
    if (status === "SUSPENDED") {
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

  const countFor = (status) =>
    status
      ? restaurants.filter((restaurant) => restaurant.status === status).length
      : restaurants.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-black text-foreground">
            المطاعم
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {restaurants.length} مطعم على المنصة
          </p>
        </div>
        <RefreshButton loading={loading} onClick={load} label="حدّث" />
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
          role="tablist"
          aria-label="تصفية المطاعم حسب الحالة"
          className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface p-1.5"
        >
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value ?? "all"}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                statusFilter === filter.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-muted/10 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  statusFilter === filter.value
                    ? "bg-white/20 text-white"
                    : "bg-muted/15 text-muted"
                }`}
              >
                {countFor(filter.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

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
                className="flex flex-col gap-3 p-4 odd:bg-white/40 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <Link
                  href={`/admin/restaurants/${restaurant.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Store className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14.5px] font-bold text-foreground">
                      {restaurant.name}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      {restaurant.cuisine ? (
                        <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[11px] font-bold text-muted">
                          {restaurant.cuisine}
                        </span>
                      ) : null}
                      <span className="truncate text-[12.5px] text-muted">
                        {restaurant.ownerName}
                      </span>
                    </span>
                  </span>
                </Link>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <AdminStatusSelect
                    value={restaurant.status}
                    statuses={RESTAURANT_STATUSES}
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
        title="تعليق المطعم"
        message={
          pending
            ? `هل أنت متأكد من تعليق ${pending.restaurant.name}؟ بعد التعليق ما رح يظهر المطعم للزبائن ولا بيقدر يستقبل طلبات.`
            : ""
        }
        confirmLabel="علّق المطعم"
        busy={Boolean(pending && busyId === pending.restaurant.id)}
        onConfirm={() => pending && applyStatus(pending.restaurant, "SUSPENDED")}
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
