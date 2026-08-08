"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import OwnerEmptyState from "@components/owner/OwnerEmptyState";
import { OwnerCardSkeleton } from "@components/owner/OwnerSkeleton";
import RestaurantSettingsForm from "@components/owner/RestaurantSettingsForm";
import { useOwner } from "@context/OwnerContext";

export default function OwnerSettingsPage() {
  const { restaurant, restaurantLoading } = useOwner();

  if (restaurantLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <OwnerCardSkeleton />
        <OwnerCardSkeleton />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <OwnerEmptyState
        icon={<Settings className="h-6 w-6" aria-hidden="true" />}
        title="عمّر مطعمك الأول"
        description="إعدادات المطعم بتظهر لما تعمّر مطعمك — بياناته، سعره، وموقعه."
      >
        <Link
          href="/owner"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          روح لإعداد المطعم
        </Link>
      </OwnerEmptyState>
    );
  }

  return <RestaurantSettingsForm restaurant={restaurant} />;
}
