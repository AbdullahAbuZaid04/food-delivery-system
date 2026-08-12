"use client";

import Link from "next/link";
import { use } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  BadgeCheck,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import AdminStatusSelect from "@components/admin/AdminStatusSelect";
import ConfirmStatusModal from "@components/admin/ConfirmStatusModal";
import { getUserById, updateDriverStatus, updateUserStatus } from "@lib/api/admin";
import {
  adminDriverStatusLabel,
  adminDriverStatusOptions,
  adminUserStatusLabel,
  adminUserToDetail,
  formatOwnerDateTime,
} from "@lib/api/presenters";

const USER_STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"];

const ROLE_LABELS = {
  CUSTOMER: "زبون",
  OWNER: "مالك",
  DRIVER: "سائق",
  ADMIN: "أدمن",
};

export default function AdminUserDetailPage({ params }) {
  const { id } = use(params);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [driverRejectOpen, setDriverRejectOpen] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const detail = await getUserById(id);
      setUser(adminUserToDetail(detail));
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل المستخدم.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();
  }, [loadUser]);

  const applyStatus = useCallback(
    async (status) => {
      if (!user || status === user.status) return;
      setBusy(true);
      setConfirmOpen(false);
      try {
        await updateUserStatus(user.id, status);
        toast.success(`تم تحديث حالة ${user.name}`);
        await loadUser();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusy(false);
      }
    },
    [user, loadUser],
  );

  const handleRequestChange = (status) => {
    if (status === user.status) return;
    if (status === "BLOCKED") {
      setConfirmOpen(true);
      return;
    }
    applyStatus(status);
  };

  // Driver membership (join approval) is a separate status from the account's
  // user status — it powers the "قيد المراجعة" tab on the users page. Only
  // DRIVER users show it.
  const applyDriverStatus = useCallback(
    async (status) => {
      if (!user || status === user.driverStatus) return;
      setBusy(true);
      setDriverRejectOpen(false);
      try {
        await updateDriverStatus(user.id, status);
        toast.success(`تم تحديث حالة ${user.name}`);
        await loadUser();
      } catch (err) {
        toast.error(err.message || "صارت مشكلة في تحديث الحالة.");
      } finally {
        setBusy(false);
      }
    },
    [user, loadUser],
  );

  const handleDriverRequestChange = (status) => {
    if (status === user.driverStatus) return;
    if (status === "REJECTED") {
      setDriverRejectOpen(true);
      return;
    }
    applyDriverStatus(status);
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
          عم نقرا بيانات المستخدم…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display font-bold text-foreground">
          صارت مشكلة في تحميل المستخدم
        </p>
        <p className="mt-1 text-[13.5px] text-muted">{error}</p>
        <button
          type="button"
          onClick={loadUser}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          حاول مرة تانية
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex h-11 items-center gap-1 text-[14px] font-bold text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        كل المستخدمين
      </Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary-dark">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 font-display text-[22px] font-black text-foreground">
              {user.name}
              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-success">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  موثّق
                </span>
              ) : null}
            </h1>
            <p className="mt-0.5 text-[13.5px] text-muted">
              {user.email}
              {user.phone ? ` · ${user.phone}` : ""}
              {" · "}
              {ROLE_LABELS[user.role] ?? user.role}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === "DRIVER" ? (
            <AdminStatusSelect
              value={user.driverStatus}
              statuses={adminDriverStatusOptions(user.driverStatus)}
              labelFor={adminDriverStatusLabel}
              onRequestChange={handleDriverRequestChange}
              disabled={busy}
            />
          ) : null}
          <AdminStatusSelect
            value={user.status}
            statuses={USER_STATUSES}
            labelFor={adminUserStatusLabel}
            onRequestChange={handleRequestChange}
            disabled={busy}
          />
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="user-info-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2 id="user-info-title" className="font-display font-bold text-foreground">
            معلومات الحساب
          </h2>
          <dl className="mt-3 space-y-2.5 text-[13.5px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">الدور</dt>
              <dd className="font-semibold text-foreground">
                {ROLE_LABELS[user.role] ?? user.role}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">الحالة</dt>
              <dd className="font-semibold text-foreground">{user.statusLabel}</dd>
            </div>
            {user.role === "DRIVER" ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">حالة الانضمام</dt>
                <dd className="font-semibold text-foreground">
                  {adminDriverStatusLabel(user.driverStatus)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">توثيق الحساب</dt>
              <dd className="font-semibold text-foreground">
                {user.isVerified ? "موثّق" : "غير موثّق"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">آخر تسجيل دخول</dt>
              <dd className="font-semibold text-foreground">
                {user.lastLoginAt
                  ? formatOwnerDateTime(user.lastLoginAt)
                  : "ما سجل دخول بعد"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">تاريخ الانضمام</dt>
              <dd className="font-semibold text-foreground">
                {formatOwnerDateTime(user.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="user-addresses-title"
          className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="user-addresses-title"
            className="font-display font-bold text-foreground"
          >
            العناوين المحفوظة
          </h2>
          {user.addresses.length === 0 ? (
            <p className="mt-3 text-[13.5px] text-muted">ما في عناوين محفوظة.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {user.addresses.map((address, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-xl bg-muted/10 px-3 py-2.5 text-[13.5px] text-foreground"
                >
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="min-w-0">{address}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {user.status === "BLOCKED" ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-error/25 bg-error/10 px-4 py-3.5 text-[14px] font-bold text-error">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
          هالمستخدم محظور وما بيقدر يسجل دخول.
        </p>
      ) : null}

      <ConfirmStatusModal
        open={confirmOpen}
        title="حظر المستخدم"
        message={`هل أنت متأكد من حظر ${user.name}؟ بعد الحظر ما رح يقدر يسجل دخول ولا يطلب من المنصة.`}
        confirmLabel="احظر المستخدم"
        busy={busy}
        onConfirm={() => applyStatus("BLOCKED")}
        onClose={() => setConfirmOpen(false)}
      />

      <ConfirmStatusModal
        open={driverRejectOpen}
        title="رفض طلب السائق"
        message={`هل أنت متأكد من رفض طلب انضمام ${user.name}؟ رح يظهر له إنه مرفوض، وما رح يقدر يستلم توصيلات.`}
        confirmLabel="ارفض الطلب"
        busy={busy}
        onConfirm={() => applyDriverStatus("REJECTED")}
        onClose={() => setDriverRejectOpen(false)}
      />
    </div>
  );
}
