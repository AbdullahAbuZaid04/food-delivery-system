"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import AppHeader from "@components/customer/AppHeader";
import RestaurantHeader from "@components/customer/RestaurantHeader";
import MenuCategoryTabs, {
  MENU_STICKY_OFFSET,
} from "@components/customer/MenuCategoryTabs";
import MenuItemCard from "@components/customer/MenuItemCard";
import RestaurantConflictModal from "@components/customer/RestaurantConflictModal";
import { useCart } from "@context/CartContext";
import { useAuth } from "@context/AuthContext";
import { getRestaurantBySlug } from "@lib/api/restaurants";
import { getCategoriesByRestaurant } from "@lib/api/categories";
import { getMealsByRestaurant } from "@lib/api/meals";
import {
  DEFAULT_COVER_IMAGE,
  mealToCard,
  restaurantToCard,
} from "@lib/api/presenters";

function RestaurantLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="جاري تحميل المنيو">
      <div className="w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] bg-clay/10 animate-pulse motion-reduce:animate-none" />
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pt-8">
        <div className="h-9 w-2/3 rounded-full bg-clay/15 animate-pulse motion-reduce:animate-none" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-2xl bg-clay/10 animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
        <div className="space-y-4 mt-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-[24px] bg-clay/10 animate-pulse motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantLoadError({ message, onRetry }) {
  return (
    <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
      <div className="bg-cream-deep border border-clay/10 rounded-[24px] p-8 text-center">
        <h1 className="font-display font-bold text-lg text-cocoa">
          صارت مشكلة في تحميل المنيو
        </h1>
        <p className="text-cocoa-soft text-[14px] mt-2">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="h-11 px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            أعد المحاولة
          </button>
          <Link
            href="/home"
            className="h-11 inline-flex items-center px-6 rounded-full border-2 border-clay/20 text-cocoa font-bold text-[14.5px] hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            رجّع للمطاعم
          </Link>
        </div>
      </div>
    </div>
  );
}

function RestaurantNotFound() {
  return (
    <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
      <div className="bg-cream-deep border border-clay/10 rounded-[24px] p-8 text-center">
        <h1 className="font-display font-bold text-lg text-cocoa">
          ما لقينا هالمطعم
        </h1>
        <p className="text-cocoa-soft text-[14px] mt-2">
          يمكن المطعم اتقفل أو الرابط غلط — جرب تتصفح مطاعم غزة.
        </p>
        <Link
          href="/home"
          className="mt-5 inline-flex h-11 items-center px-6 rounded-full bg-terra text-cream font-bold text-[14.5px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          تصفح المطاعم
        </Link>
      </div>
    </div>
  );
}

function RestaurantDetailPage({ params }) {
  const { slug } = use(params);
  const { user } = useAuth();
  const {
    restaurantId: cartRestaurantId,
    restaurantName,
    items,
    addItem,
    clearCart,
    setDeliveryFee,
  } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState("");
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const loadRestaurant = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setIsNotFound(false);
    try {
      const detail = await getRestaurantBySlug(slug);
      if (!detail) {
        setIsNotFound(true);
        return;
      }
      const [categories, meals] = await Promise.all([
        getCategoriesByRestaurant(detail.id),
        getMealsByRestaurant(detail.id),
      ]);
      const categoryList = Array.isArray(categories) ? categories : [];
      const mealList = Array.isArray(meals) ? meals : [];
      const grouped = categoryList
        .map((category) => ({
          id: category.id,
          name: category.name,
          items: mealList
            .filter((meal) => meal.category?.id === category.id)
            .map(mealToCard),
        }))
        .filter((category) => category.items.length > 0);
      setRestaurant(detail);
      setMenuCategories(grouped);
    } catch (err) {
      if (err?.status === 404) {
        setIsNotFound(true);
      } else {
        setError(err?.message || "صارت مشكلة في تحميل المنيو");
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    if (!restaurant) return;
    if (cartRestaurantId === restaurant.id || items.length === 0) {
      setDeliveryFee(restaurant.deliveryFee ?? 0);
    }
  }, [restaurant, cartRestaurantId, items.length, setDeliveryFee]);

  const handleConflict = (pending) => {
    setPendingItem(pending);
    setIsConflictOpen(true);
  };

  const handleConfirmConflict = () => {
    if (!pendingItem) return;
    const { item, restaurantId, restaurantName: incomingName } = pendingItem;
    clearCart();
    addItem(item, restaurantId, incomingName);
    setDeliveryFee(restaurant?.deliveryFee ?? 0);
    toast.success(`ضفنا "${item.name}" عالسلة`);
    setIsConflictOpen(false);
    setPendingItem(null);
  };

  if (isNotFound) {
    return (
      <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
        <AppHeader userName={user?.firstName} showSearch={false} />
        <RestaurantNotFound />
      </div>
    );
  }

  const headerRestaurant = restaurant ? restaurantToCard(restaurant) : null;
  const coverImage =
    restaurant?.coverImageUrl || restaurant?.coverImage || DEFAULT_COVER_IMAGE;
  const reviewCount = restaurant?._count?.reviews ?? 0;

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName={user?.firstName} showSearch={false} />

      {isLoading ? (
        <RestaurantLoadingSkeleton />
      ) : error ? (
        <RestaurantLoadError message={error} onRetry={loadRestaurant} />
      ) : (
        <>
          <RestaurantHeader
            restaurant={headerRestaurant}
            coverImage={coverImage}
            reviewCount={reviewCount}
          />

          <MenuCategoryTabs categories={menuCategories} />

          <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 pt-4 md:pt-6">
            <h2 className="sr-only">منيو {restaurant.name}</h2>
            {menuCategories.length > 0 ? (
              menuCategories.map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  aria-labelledby={`tab-${category.id}`}
                  style={{ scrollMarginTop: MENU_STICKY_OFFSET }}
                  className="pt-8 md:pt-10"
                >
                  <h3 className="font-display font-bold text-[22px] md:text-[24px] text-cocoa">
                    {category.name}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {category.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        restaurantId={restaurant.id}
                        restaurantName={restaurant.name}
                        onConflict={handleConflict}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-cocoa-soft text-[15px]">
                  لسا ما في منيو منشور لهالمطعم.
                </p>
              </div>
            )}
          </main>
        </>
      )}

      <RestaurantConflictModal
        open={isConflictOpen}
        currentRestaurantName={restaurantName}
        incomingRestaurantName={pendingItem?.restaurantName}
        onClose={() => {
          setIsConflictOpen(false);
          setPendingItem(null);
        }}
        onConfirm={handleConfirmConflict}
      />
    </div>
  );
}

export default RestaurantDetailPage;
