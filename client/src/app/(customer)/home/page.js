"use client";

import { useMemo, useState } from "react";
import AppHeader from "@components/customer/AppHeader";
import GreetingBanner from "@components/customer/GreetingBanner";
import CategoryFilterBar from "@components/customer/CategoryFilterBar";
import RestaurantGrid from "@components/customer/RestaurantGrid";
import EmptyState from "@components/customer/EmptyState";
import BottomNav from "@components/customer/BottomNav";
import { RESTAURANT_CATEGORIES, restaurants } from "@lib/mock/restaurants";

const MOCK_USER_NAME = "أحمد";

function CustomerHomePage() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const inCategory =
        activeCategory === "الكل" || restaurant.category === activeCategory;
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
  }, [activeCategory, searchQuery]);

  const clearFilters = () => {
    setActiveCategory("الكل");
    setSearchQuery("");
  };

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader
        userName={MOCK_USER_NAME}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 md:pt-8 pb-20 md:pb-0">
        <GreetingBanner userName={MOCK_USER_NAME} />

        <CategoryFilterBar
          categories={RESTAURANT_CATEGORIES}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {filteredRestaurants.length > 0 ? (
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
