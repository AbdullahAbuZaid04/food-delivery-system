"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Clock, ShieldAlert } from "lucide-react";
import { useOwner } from "@context/OwnerContext";
import { restaurantApi } from "@lib/api";
import OwnerEmptyState from "./OwnerEmptyState";

// RestaurantApprovalView — shown instead of the dashboard pages while the
// restaurant is PENDING (admin review) or REJECTED. A pending restaurant has no
// orders/menu to manage yet; a rejected one offers the owner a one-tap
// re-submission back into the admin queue.
export default function RestaurantApprovalView({ status }) {
  const { reloadRestaurant } = useOwner();
  const [resubmitting, setResubmitting] = useState(false);

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await restaurantApi.updateMyRestaurantStatus("PENDING");
      await reloadRestaurant();
      toast.success("انرجع طلب مراجعة مطعمك — الأدمن رح يبينه قريباً");
    } catch (err) {
      toast.error(err.message || "صارت مشكلة بإعادة الطلب، حاول مرة تانية.");
    } finally {
      setResubmitting(false);
    }
  };

  if (status === "PENDING") {
    return (
      <OwnerEmptyState
        icon={<Clock className="h-7 w-7" aria-hidden="true" />}
        title="مطعمك قيد المراجعة"
        description="بيانات مطعمك اتسجّلت، والأدمن عم يراجعها هلق. بعد ما يبينها ويقبلها، مطعمك رح يشتغل ويظهر للزبائن — نوّصلك أول ما يصير."
      />
    );
  }

  return (
    <OwnerEmptyState
      icon={<ShieldAlert className="h-7 w-7" aria-hidden="true" />}
      title="المطعم مرفوض من الأدمن"
      description="ما رح يظهر مطعمك للزبائن هلق. إذا بتحب تعيد طلب المراجعة من جديد، كبس الزر تحت — والأدمن رح يبينه تاني."
    >
      <button
        type="button"
        onClick={handleResubmit}
        disabled={resubmitting}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
      >
        {resubmitting ? "عم نعيد الطلب…" : "أعد طلب المراجعة"}
      </button>
    </OwnerEmptyState>
  );
}
