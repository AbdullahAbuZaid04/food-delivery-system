"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Clock, ShieldAlert } from "lucide-react";
import { useAuth } from "@context/AuthContext";
import { authApi } from "@lib/api";

// DriverApprovalView — shown instead of the dashboard pages while the driver's
// membership is PENDING (admin review) or REJECTED. A pending driver can't take
// deliveries yet; a rejected one can re-submit back into the admin queue,
// mirroring the restaurant approval flow (RestaurantApprovalView).
export default function DriverApprovalView({ status }) {
  const { refreshProfile } = useAuth();
  const [resubmitting, setResubmitting] = useState(false);

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await authApi.reapplyAsDriver();
      await refreshProfile();
      toast.success("انرجع طلب انضمامك — الأدمن رح يبينه قريباً");
    } catch (err) {
      toast.error(err.message || "صارت مشكلة بإعادة الطلب، حاول مرة تانية.");
    } finally {
      setResubmitting(false);
    }
  };

  if (status === "PENDING") {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-7 w-7 text-primary" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-lg font-bold text-foreground">
          طلبك قيد المراجعة
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          انضممت لفريق التوصيل، والأدمن عم يراجع طلبك هلق. بعد ما يقبله، رح
          يصلك أول توصيلة — نوّصلك أول ما يصير.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <ShieldAlert className="h-7 w-7 text-error" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-foreground">
        طلبك مرفوض من الأدمن
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        ما رح يقدر تستلم توصيلات هلق. إذا بتحب تعيد طلب المراجعة من جديد، كبس
        الزر تحت — والأدمن رح يبينه تاني.
      </p>
      <button
        type="button"
        onClick={handleResubmit}
        disabled={resubmitting}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
      >
        {resubmitting ? "عم نعيد الطلب…" : "أعد طلب المراجعة"}
      </button>
    </div>
  );
}
