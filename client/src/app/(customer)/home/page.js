"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "@components/customer/AppHeader";
import GreetingBanner from "@components/customer/GreetingBanner";
import CategoryFilterBar from "@components/customer/CategoryFilterBar";
import RestaurantGrid from "@components/customer/RestaurantGrid";
import EmptyState from "@components/customer/EmptyState";
import BottomNav from "@components/customer/BottomNav";
import { getRestaurants } from "@lib/api/restaurants";
import { restaurantToCard } from "@lib/api/presenters";
import { useAuth } from "@context/AuthContext";

const ALL_CATEGORIES = "الكل";

function HomeLoadingGrid() {
  return (
    <section aria-label="جاري تحميل المطاعم" className="mt-8 md:mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
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
    </section>
  );
}

function HomeErrorState({ onRetry }) {
  return (
    <section
      aria-live="polite"
      className="mt-8 md:mt-10 bg-cream-deep border border-clay/10 rounded-[24px] p-8 text-center"
    >
      <h2 className="font-display font-bold text-lg text-cocoa">
        صارت مشكلة في تحميل المطاعم
      </h2>
      <p className="text-cocoa-soft text-[14px] mt-2">
        يمكن الخادم مش شغال، جرب مرة تانية بعد شوية.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 h-11 px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
      >
        أعد المحاولة
      </button>
    </section>
  );
}

function CustomerHomePage() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getRestaurants();
      setRestaurants(Array.isArray(result) ? result : (result?.restaurants ?? []));
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

  const categories = useMemo(() => {
    const seen = [];
    restaurants.forEach((restaurant) => {
      const cuisine = restaurant.cuisine;
      if (cuisine && !seen.includes(cuisine)) seen.push(cuisine);
    });
    return [ALL_CATEGORIES, ...seen];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return restaurants
      .map(restaurantToCard)
      .filter((restaurant) => {
        const inCategory =
          activeCategory === ALL_CATEGORIES ||
          restaurant.category === activeCategory;
        if (!inCategory) return false;
        if (!query) return true;
        const haystack = [
          restaurant.name,
          restaurant.cuisine,
          restaurant.category,
          ...restaurant.dishes,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
  }, [restaurants, activeCategory, searchQuery]);

  const clearFilters = () => {
    setActiveCategory(ALL_CATEGORIES);
    setSearchQuery("");
  };

  const userName = user?.firstName ?? "";

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader
        userName={userName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <GreetingBanner userName={userName} />

        <CategoryFilterBar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {isLoading ? (
          <HomeLoadingGrid />
        ) : error ? (
          <HomeErrorState onRetry={fetchRestaurants} />
        ) : filteredRestaurants.length > 0 ? (
          <RestaurantGrid restaurants={filteredRestaurants} />
        ) : (
          <EmptyState onClearFilters={clearFilters} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default CustomerHomePage;
