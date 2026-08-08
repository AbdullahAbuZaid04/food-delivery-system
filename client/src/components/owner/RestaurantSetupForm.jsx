"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { restaurantApi } from "@lib/api";
import { useOwner } from "@context/OwnerContext";
import RestaurantForm from "./RestaurantForm";

// Shown on the dashboard when the owner has no restaurant yet — the create
// flow, then the context reloads and the dashboard switches to the real view.
export default function RestaurantSetupForm() {
  const { reloadRestaurant } = useOwner();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await restaurantApi.createRestaurant(payload);
      await reloadRestaurant();
      toast.success("مبروك! مطعمك عمّر وظاهر للزبائن");
    } catch (err) {
      setError(err.message || "تعذر حفظ المطعم، حاول مرة تانية.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RestaurantForm
      initial={{}}
      onSave={handleSave}
      submitting={submitting}
      error={error}
      submitLabel="عمّر مطعمي"
      title="أهلاً بك يا مالك"
      subtitle="لسا ما عمّرتَ مطعمك بعد — عبّي هالمعلومات وخلّيك جاهز تستقبل طلبات."
    />
  );
}
