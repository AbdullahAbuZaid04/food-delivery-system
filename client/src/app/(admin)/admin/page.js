"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import RefreshButton from "@components/owner/RefreshButton";
import { getRestaurants, getUsers } from "@lib/api/admin";
import {
  adminRestaurantToCard,
  adminUserToCard,
} from "@lib/api/presenters";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      {Icon ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="font-display text-xl font-black text-foreground">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] font-semibold text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

const ROLE_DISTRIBUTION = [
  { role: "CUSTOMER", label: "زبون", icon: UserRound },
  { role: "OWNER", label: "مالك", icon: Store },
  { role: "DRIVER", label: "سائق", icon: Truck },
  { role: "ADMIN", label: "أدمن", icon: ShieldCheck },
];

export default function AdminOverviewPage() {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, restaurantData] = await Promise.all([
        getUsers({ limit: 100 }),
        getRestaurants({ limit: 100 }),
      ]);
      setUsers(userData.map(adminUserToCard));
      setRestaurants(restaurantData.map(adminRestaurantToCard));
    } catch (err) {
      setError(err.message || "تعذر تحميل البيانات، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const blockedUsers = users.filter((user) => user.status === "BLOCKED").length;
  const openRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === "OPEN",
  ).length;
  const suspendedRestaurants = restaurants.filter(
    (restaurant) => restaurant.status === "SUSPENDED",
  ).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-black text-foreground">
            نظرة عامة
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            خلاصة حالة المنصة
          </p>
        </div>
        <RefreshButton loading={loading} onClick={load} label="حدّث" />
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-display font-bold text-foreground">
            صارت مشكلة في تحميل البيانات
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
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
            />
          ))}
          <span className="sr-only">عم نقرا البيانات…</span>
        </div>
      ) : null}

      {!error && !loading ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="مستخدمين مسجلين"
              value={users.length}
            />
            <StatCard icon={Store} label="مطاعم على المنصة" value={restaurants.length} />
            <StatCard label="مطاعم مفتوحة" value={openRestaurants} />
            <StatCard label="مستخدمين محظورين" value={blockedUsers} />
          </div>

          {blockedUsers + suspendedRestaurants > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error/15 text-error">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[14px] font-bold text-foreground">
                  يحتاج انتباهك
                </p>
                <p className="text-[12.5px] text-muted">
                  عندك حالات تستاهل مراجعة سريعة.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {blockedUsers > 0 ? (
                  <Link
                    href="/admin/users"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-error/30 bg-white px-3.5 text-[12.5px] font-bold text-error transition-colors hover:border-error focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
                  >
                    {blockedUsers} محظور
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
                {suspendedRestaurants > 0 ? (
                  <Link
                    href="/admin/restaurants?status=SUSPENDED"
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-error/30 bg-white px-3.5 text-[12.5px] font-bold text-error transition-colors hover:border-error focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40"
                  >
                    {suspendedRestaurants} مطعم معلّق
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <h2 className="mt-6 font-display font-bold text-foreground">
            توزيع الأدوار
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ROLE_DISTRIBUTION.map(({ role, label, icon: Icon }) => {
              const count = users.filter((user) => user.role === role).length;
              return (
                <Link
                  key={role}
                  href={`/admin/users?role=${role}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-xl font-black text-foreground">
                        {count}
                      </span>
                      <span className="block truncate text-[12.5px] font-semibold text-muted">
                        {label}
                      </span>
                    </span>
                  </span>
                  <ChevronLeft
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section
              aria-labelledby="recent-users-title"
              className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-users-title"
                  className="font-display font-bold text-foreground"
                >
                  آخر المستخدمين
                </h2>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  كل المستخدمين
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {users.slice(0, 5).map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-foreground">
                          {user.name}
                        </span>
                        <span className="block truncate text-[12.5px] text-muted">
                          {user.email}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-muted/15 px-2.5 py-1 text-[11.5px] font-bold text-muted">
                        {user.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="recent-restaurants-title"
              className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id="recent-restaurants-title"
                  className="font-display font-bold text-foreground"
                >
                  آخر المطاعم
                </h2>
                <Link
                  href="/admin/restaurants"
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  كل المطاعم
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {restaurants.slice(0, 5).map((restaurant) => (
                  <li key={restaurant.id}>
                    <Link
                      href={`/admin/restaurants/${restaurant.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-foreground">
                          {restaurant.name}
                        </span>
                        <span className="block truncate text-[12.5px] text-muted">
                          {restaurant.ownerName}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                          restaurant.status === "OPEN"
                            ? "bg-success/15 text-success"
                            : restaurant.status === "SUSPENDED"
                              ? "bg-error/15 text-error"
                              : "bg-muted/15 text-muted"
                        }`}
                      >
                        {restaurant.statusLabel}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
