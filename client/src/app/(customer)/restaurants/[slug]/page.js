"use client";

import { use, useCallback, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "react-hot-toast";
import AppHeader from "@components/customer/AppHeader";
import RestaurantHeader from "@components/customer/RestaurantHeader";
import MenuCategoryTabs, {
  MENU_STICKY_OFFSET,
} from "@components/customer/MenuCategoryTabs";
import MenuItemCard from "@components/customer/MenuItemCard";
import CartSummaryBar from "@components/customer/CartSummaryBar";
import { restaurants } from "@lib/mock/restaurants";
import { getRestaurantMenu } from "@lib/mock/menu";

function RestaurantDetailPage({ params }) {
  const { slug } = use(params);

  const restaurant = restaurants.find((item) => item.id === slug);
  const menu = getRestaurantMenu(slug);

  if (!restaurant || !menu) {
    notFound();
  }

  const [cartItems, setCartItems] = useState([]);
  const [isFavorite, setIsFavorite] = useState(restaurant.isFavorite ?? false);

  const menuItemById = useMemo(() => {
    const map = new Map();
    for (const category of menu.menuCategories) {
      for (const item of category.items) map.set(item.id, item);
    }
    return map;
  }, [menu]);

  const addItem = useCallback(
    (itemId) => {
      const alreadyInCart = cartItems.some((entry) => entry.menuItemId === itemId);
      if (!alreadyInCart) {
        const item = menuItemById.get(itemId);
        toast.success(item ? `ضفنا "${item.name}" عالسلة` : "ضفنا الصنف عالسلة");
      }
      setCartItems((previous) => {
        const existing = previous.find((entry) => entry.menuItemId === itemId);
        if (existing) {
          return previous.map((entry) =>
            entry.menuItemId === itemId
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          );
        }
        return [...previous, { menuItemId: itemId, quantity: 1 }];
      });
    },
    [cartItems, menuItemById],
  );

  const removeItem = useCallback((itemId) => {
    setCartItems((previous) =>
      previous.filter((entry) => entry.menuItemId !== itemId),
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId, quantity) => {
      if (quantity <= 0) {
        const item = menuItemById.get(itemId);
        toast.success(item ? `شلنا "${item.name}" من السلة` : "شلنا الصنف من السلة");
        removeItem(itemId);
        return;
      }
      setCartItems((previous) =>
        previous.map((entry) =>
          entry.menuItemId === itemId ? { ...entry, quantity } : entry,
        ),
      );
    },
    [menuItemById, removeItem],
  );

  const quantityByItemId = useMemo(() => {
    const map = new Map();
    for (const entry of cartItems) map.set(entry.menuItemId, entry.quantity);
    return map;
  }, [cartItems]);

  const { totalCount, totalPrice } = useMemo(() => {
    let count = 0;
    let price = 0;
    for (const entry of cartItems) {
      const item = menuItemById.get(entry.menuItemId);
      if (!item) continue;
      count += entry.quantity;
      price += entry.quantity * item.price;
    }
    return { totalCount: count, totalPrice: price };
  }, [cartItems, menuItemById]);

  const handleCheckout = () => {
    toast.success("تسلم إيدك! خطوة الدفع رح نبنيلها بالمرحلة الجاية.");
  };

  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal">
      <AppHeader
        userName="أحمد"
        cartCount={totalCount}
        showSearch={false}
      />

      <RestaurantHeader
        restaurant={restaurant}
        coverImage={menu.coverImage}
        reviewCount={menu.reviewsCount ?? 0}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((previous) => !previous)}
      />

      <MenuCategoryTabs categories={menu.menuCategories} />

      <main className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 pb-32 pt-4 md:pt-6">
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
                  quantity={quantityByItemId.get(item.id) ?? 0}
                  onAdd={() => addItem(item.id)}
                  onIncrement={() => addItem(item.id)}
                  onDecrement={() =>
                    updateQuantity(item.id, (quantityByItemId.get(item.id) ?? 0) - 1)
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <CartSummaryBar
        totalCount={totalCount}
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default RestaurantDetailPage;
