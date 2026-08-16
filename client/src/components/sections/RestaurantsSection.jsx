"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Ornament from "@components/ui/Ornament";
import RestaurantCard from "@components/ui/RestaurantCard";
import { getRestaurants } from "@lib/api/restaurants";
import { restaurantToCard } from "@lib/api/presenters";

const SECTION_LIMIT = 4;

/**
 * RestaurantsSection — grid of partner restaurants pulled live from the API
 * (same source/presenter as the /home storefront), plus a "see all" CTA.
 */
function RestaurantsSection() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getRestaurants({ limit: SECTION_LIMIT });
      const list = Array.isArray(result) ? result : (result?.restaurants ?? []);
      setRestaurants(list.slice(0, SECTION_LIMIT).map(restaurantToCard));
    } catch (err) {
      setError(err?.message || "صارت مشكلة في تحميل المطاعم");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRestaurants();
  }, [fetchRestaurants]);

  return (
    <section id="restaurants" className="scroll-mt-24 py-16 lg:py-24">
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <Ornament />
        <h2 className="font-display font-black text-[clamp(28px,3.6vw,40px)] text-cocoa text-center mt-4">
          مطاعم بتحكي طعمة غزة
        </h2>
        <p className="text-cocoa-soft text-center mt-3 max-w-[500px] mx-auto">
          كلها بمكان واحد، بأسعار شفافة وتقييمات حقيقية.
        </p>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-cream-deep border border-clay/10 rounded-[24px] p-6 animate-pulse motion-reduce:animate-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-clay/20" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded-full bg-clay/20" />
                    <div className="h-3 w-1/3 rounded-full bg-clay/15" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-6 w-20 rounded-full bg-clay/15" />
                  <div className="h-6 w-16 rounded-full bg-clay/15" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-cocoa-soft mt-10">
            صارت مشكلة في تحميل المطاعم — جرب تفتح صفحة المطاعم.
          </p>
        ) : restaurants.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : null}

        <div className="text-center mt-10">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 border-2 border-terra text-terra font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-terra/5 transition-colors"
          >
            شوف كل المطاعم +١٢٠
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RestaurantsSection;
