"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { restaurantApi } from "@lib/api";
import { useOwner } from "@context/OwnerContext";
import RestaurantForm from "./RestaurantForm";
import { primaryButtonClass, secondaryButtonClass } from "./OwnerFields";

export default function RestaurantSettingsForm({ restaurant }) {
  const { reloadRestaurant } = useOwner();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const isOpen = restaurant.status === "OPEN";
  const isSuspended = restaurant.status === "SUSPENDED";

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await restaurantApi.updateMyRestaurant(payload);
      await reloadRestaurant();
      toast.success("تم حفظ التعديلات");
    } catch (err) {
      setError(err.message || "تعذر حفظ التعديلات، حاول مرة تانية.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async () => {
    setStatusBusy(true);
    try {
      const next = isOpen ? "CLOSED" : "OPEN";
      await restaurantApi.updateMyRestaurantStatus(next);
      await reloadRestaurant();
      toast.success(
        next === "OPEN"
          ? "مطعمك فتح — هلا الزبائن يقدروا يطلبوا منو"
          : "مطعمك انغلق هلق",
      );
    } catch (err) {
      toast.error(err.message || "تعذر تغيير حالة المطعم.");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div
        className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
          isSuspended
            ? "border-warning/40 bg-warning/5"
            : "border-border bg-surface"
        }`}
      >
        <div>
          <p className="font-display text-[16px] font-bold text-foreground">
            حالة المطعم
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {isSuspended
              ? "مطعمك معلّق من إدارة وجبة — الزبائن ما بيقدروا يطلبوا منو لحتى ترجع الحالة عادية."
              : isOpen
                ? "مطعمك مفتوح والزبائن يقدروا يطلبوا منو"
                : "مطعمك مغلق حالياً — الزبائن ما رح يقدروا يطلبوا"}
          </p>
        </div>
        {!isSuspended ? (
          <button
            type="button"
            onClick={toggleStatus}
            disabled={statusBusy}
            className={isOpen ? secondaryButtonClass : primaryButtonClass}
          >
            {statusBusy
              ? "بالتغيير…"
              : isOpen
                ? "أغلق المطعم"
                : "افتح المطعم"}
          </button>
        ) : null}
      </div>

      <RestaurantForm
        key={restaurant.id}
        initial={restaurant}
        onSave={handleSave}
        submitting={submitting}
        error={error}
        submitLabel="حفظ التعديلات"
        title="إعدادات المطعم"
        subtitle="حدّث بيانات مطعمك وشو رح يظهر للزبائن."
        lockedFields={["email", "cuisine"]}
      />
    </div>
  );
}
