"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, Search, Users } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminStatusSelect from "@components/admin/AdminStatusSelect";
import ConfirmStatusModal from "@components/admin/ConfirmStatusModal";
import RefreshButton from "@components/owner/RefreshButton";
import { getUsers, updateDriverStatus, updateUserStatus } from "@lib/api/admin";
import {
  adminDriverStatusLabel,
  adminDriverStatusOptions,
  adminUserStatusLabel,
  adminUserToCard,
} from "@lib/api/presenters";

const USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"];
// "PENDING" is a virtual tab (value clashes with nothing — it is not a role):
// it shows the driver join requests awaiting admin review (role DRIVER +
// driverStatus PENDING), mirroring the old /admin/drivers queue merged into
// the users page.
const ROLE_FILTERS = [
  { value: null, label: "الكل" },
  { value: "CUSTOMER", label: "الزبائن" },
  { value: "OWNER", label: "المالكون" },
  { value: "DRIVER", label: "السائقون" },
  { value: "ADMIN", label: "الأدمن" },
  { value: "PENDING", label: "قيد المراجعة" },
];

const ROLE_LABELS = {
  CUSTOMER: "زبون",
  OWNER: "مالك",
  DRIVER: "سائق",
  ADMIN: "أدمن",
};

const ROLE_BADGE_CLASSES = {
  CUSTOMER: "bg-primary/10 text-primary-dark",
  OWNER: "bg-warning/15 text-warning",
  DRIVER: "bg-success/15 text-success",
  ADMIN: "bg-error/15 text-error",
};

const DRIVER_STATUS_BADGE_CLASSES = {
  PENDING: "bg-warning/15 text-warning",
  APPROVED: "bg-success/15 text-success",
  REJECTED: "bg-error/15 text-error",
};

// A user matches the review tab when they are a driver awaiting admin approval.
const isPendingReview = (user) =>
  user.role === "DRIVER" && user.driverStatus === "PENDING";

function UsersScreen() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || null);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [pending, setPending] = useState(null); // { user, status, type }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers({ limit: 100 });
      setUsers(data.map(adminUserToCard));
    } catch (err) {
      setError(err.message || "تعذر تحميل المستخدمين، حاول مرة تانية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const applyUserStatus = useCallback(
    async (user, status) => {
      setBusyId(user.id);
      setPending(null);
      try {
        await updateUserStatus(user.id, status);
        toast.success(`تم تحديث حالة ${user.name}`);
        await load();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const applyDriverStatus = useCallback(
    async (user, status) => {
      setBusyId(user.id);
      setPending(null);
      try {
        await updateDriverStatus(user.id, status);
        toast.success(`تم تحديث حالة ${user.name}`);
        await load();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  // Drivers pick from the membership statuses (review queue); everyone else
  // picks from the account statuses. Destructive moves (BLOCKED / REJECTED)
  // go through the confirm modal.
  const handleRequestChange = (user, status) => {
    if (user.role === "DRIVER") {
      if (status === user.driverStatus) return;
      if (status === "REJECTED") {
        setPending({ user, status, type: "driver" });
        return;
      }
      applyDriverStatus(user, status);
      return;
    }
    if (status === user.status) return;
    if (status === "BLOCKED") {
      setPending({ user, status, type: "user" });
      return;
    }
    applyUserStatus(user, status);
  };

  const handleConfirm = () => {
    if (!pending) return;
    if (pending.type === "driver") {
      applyDriverStatus(pending.user, pending.status);
    } else {
      applyUserStatus(pending.user, pending.status);
    }
  };

  const query = search.trim().toLowerCase();
  const visibleUsers = users.filter((user) => {
    if (roleFilter === "PENDING") {
      if (!isPendingReview(user)) return false;
    } else if (roleFilter && user.role !== roleFilter) {
      return false;
    }
    if (!query) return true;
    return [user.name, user.email, user.phone]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const pendingCount = users.filter(isPendingReview).length;

  const countFor = (filter) => {
    if (filter === "PENDING") return pendingCount;
    return filter ? users.filter((user) => user.role === filter).length : users.length;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-black text-foreground">
            المستخدمين
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {users.length} مستخدم على المنصة
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
            placeholder="ابحث بالاسم أو البريد أو الهاتف…"
            aria-label="البحث في المستخدمين"
            className="h-12 w-full rounded-xl border border-border bg-white ps-12 pe-4 text-[13.5px] font-semibold text-foreground placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <div
          role="tablist"
          aria-label="تصفية المستخدمين حسب الدور"
          className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface p-1.5"
        >
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.value ?? "all"}
              type="button"
              role="tab"
              aria-selected={roleFilter === filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                roleFilter === filter.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-muted/10 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  roleFilter === filter.value
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

      {pendingCount > 0 && roleFilter !== "PENDING" ? (
        <button
          type="button"
          onClick={() => setRoleFilter("PENDING")}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3.5 text-start transition-colors hover:bg-warning/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="flex items-center gap-2 text-[14px] font-bold text-warning">
            <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
            عندك {pendingCount} {pendingCount === 1 ? "سائق" : "سائقين"} قيد المراجعة — افحصهم هلق
          </span>
          <ChevronLeft className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        </button>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-display font-bold text-foreground">
            صارت مشكلة في تحميل المستخدمين
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
          <span className="sr-only">عم نقرا المستخدمين…</span>
        </div>
      ) : null}

      {!error && !loading && visibleUsers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display font-bold text-foreground">
            {roleFilter === "PENDING"
              ? "ما في طلبات سائقين قيد المراجعة"
              : "ما في مستخدمين بهالتصفية"}
          </p>
        </div>
      ) : null}

      {!error && !loading && visibleUsers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <ul>
            {visibleUsers.map((user) => {
              const isDriver = user.role === "DRIVER";
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 p-4 odd:bg-white/40 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
                >
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary-dark">
                      {user.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-bold text-foreground">
                        {user.name}
                      </span>
                      <span className="block truncate text-[12.5px] text-muted">
                        {user.email}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            ROLE_BADGE_CLASSES[user.role] ??
                            "bg-muted/15 text-muted"
                          }`}
                        >
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                        {isDriver ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              DRIVER_STATUS_BADGE_CLASSES[user.driverStatus] ??
                              "bg-muted/15 text-muted"
                            }`}
                          >
                            {adminDriverStatusLabel(user.driverStatus)}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    {isDriver ? (
                      <AdminStatusSelect
                        value={user.driverStatus}
                        statuses={adminDriverStatusOptions(user.driverStatus)}
                        labelFor={adminDriverStatusLabel}
                        onRequestChange={(status) =>
                          handleRequestChange(user, status)
                        }
                        disabled={busyId === user.id}
                      />
                    ) : (
                      <AdminStatusSelect
                        value={user.status}
                        statuses={USER_STATUSES}
                        labelFor={adminUserStatusLabel}
                        onRequestChange={(status) =>
                          handleRequestChange(user, status)
                        }
                        disabled={busyId === user.id}
                      />
                    )}
                    <Link
                      href={`/admin/users/${user.id}`}
                      aria-label={`تفاصيل ${user.name}`}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <ConfirmStatusModal
        open={Boolean(pending)}
        title={pending?.type === "driver" ? "رفض طلب السائق" : "حظر المستخدم"}
        message={
          pending
            ? pending.type === "driver"
              ? `هل أنت متأكد من رفض طلب انضمام ${pending.user.name}؟ رح يظهر له إنه مرفوض، وما رح يقدر يستلم توصيلات.`
              : `هل أنت متأكد من حظر ${pending.user.name}؟ بعد الحظر ما رح يقدر يسجل دخول ولا يطلب من المنصة.`
            : ""
        }
        confirmLabel={
          pending?.type === "driver" ? "ارفض الطلب" : "احظر المستخدم"
        }
        busy={Boolean(pending && busyId === pending.user.id)}
        onConfirm={handleConfirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersScreen />
    </Suspense>
  );
}
