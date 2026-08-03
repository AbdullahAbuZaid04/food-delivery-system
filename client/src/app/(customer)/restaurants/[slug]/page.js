"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "react-hot-toast";
import AppHeader from "@components/customer/AppHeader";
import RestaurantHeader from "@components/customer/RestaurantHeader";
import MenuCategoryTabs, {
  MENU_STICKY_OFFSET,
} from "@components/customer/MenuCategoryTabs";
import MenuItemCard from "@components/customer/MenuItemCard";
import RestaurantConflictModal from "@components/customer/RestaurantConflictModal";
import { useCart } from "@context/CartContext";
import { restaurants } from "@lib/mock/restaurants";
import { getRestaurantMenu } from "@lib/mock/menu";

function RestaurantDetailPage({ params }) {
  const { slug } = use(params);

  const restaurant = restaurants.find((item) => item.id === slug);
  const menu = getRestaurantMenu(slug);

  if (!restaurant || !menu) {
    notFound();
  }

  const [isFavorite, setIsFavorite] = useState(restaurant.isFavorite ?? false);
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const { restaurantName, items, addItem, clearCart } = useCart();

  const quantityByItemId = useMemo(() => {
    const map = new Map();
    for (const entry of items) map.set(entry.menuItemId, entry.quantity);
    return map;
  }, [items]);

  const handleConflict = (pending) => {
    setPendingItem(pending);
    setIsConflictOpen(true);
  };

  const handleConfirmConflict = () => {
    if (!pendingItem) return;
    const { item, restaurantId, restaurantName } = pendingItem;
    clearCart();
    addItem(item, restaurantId, restaurantName);
    toast.success(`ضفنا "${item.name}" عالسلة`);
    setIsConflictOpen(false);
    setPendingItem(null);
  };

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader userName="أحمد" showSearch={false} />

      <RestaurantHeader
        restaurant={restaurant}
        coverImage={menu.coverImage}
        reviewCount={menu.reviewsCount ?? 0}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((previous) => !previous)}
      />

      <MenuCategoryTabs categories={menu.menuCategories} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 pt-4 md:pt-6">
        <h2 className="sr-only">منيو {restaurant.name}</h2>
        {menu.menuCategories.map((category) => (
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
        ))}
      </main>

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
