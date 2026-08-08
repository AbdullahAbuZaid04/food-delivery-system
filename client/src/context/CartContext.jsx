"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// CartContext — shared cart state for the whole customer app.
//
// Design decision (AGENTS.md §10): a single cart can only hold items from ONE
// restaurant at a time. `addItem` refuses (returns `{ conflict: true }`) when
// the caller tries to add from a different restaurant, and the *caller* decides
// what to do about it (show RestaurantConflictModal) — the context never clears
// the cart on its own.
//
// Persistence: `wajba-cart` in localStorage. The first render is always the
// empty cart and the saved value is hydrated in a `useEffect` (not a lazy
// `useState` initializer) so server HTML and client HTML always match on first
// paint — avoids the classic SSR hydration mismatch (AGENTS.md §1/§10).

const CartContext = createContext(null);

const STORAGE_KEY = "wajba-cart";

const EMPTY_CART = {
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  items: [],
};

function withoutItem(items, menuItemId) {
  return items.filter((entry) => entry.menuItemId !== menuItemId);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount only — runs after first paint, so the
  // server-rendered and first client render are both "empty cart".
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: reading browser storage must run in an effect (not a lazy useState initializer) so server + first client render both show an empty cart and we avoid an SSR hydration mismatch.
          setCart({
            restaurantId:
              parsed.items.length > 0 ? parsed.restaurantId ?? null : null,
            restaurantName:
              parsed.items.length > 0 ? parsed.restaurantName ?? null : null,
            deliveryFee: Number(parsed.deliveryFee) || 0,
            items: parsed.items,
          });
        }
      }
    } catch {
      // Corrupted/unreadable storage — keep the in-memory empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist on every change. Skipped until hydration is done so we never
  // overwrite a saved cart with the initial empty snapshot — and once hydrated
  // we always write, including the empty state after clearCart().
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full / private mode — cart still works in memory for the session.
    }
  }, [cart, hydrated]);

  const addItem = useCallback(
    (item, restaurantId, restaurantName) => {
      // The conflict decision must live INSIDE the functional updater so it
      // reads the pending cart state. If it used the `cart` closure instead,
      // the "أفرغ السلة وكمّل" confirm flow (clearCart() then addItem() in the
      // same handler) would still see the old restaurant's items and silently
      // drop the pending item. The returned `conflict` flag is read from the
      // committed closure cart — accurate for standalone adds (the only place
      // MenuItemCard checks it) and ignored by the confirm handler.
      setCart((previous) => {
        const hasOtherRestaurant =
          previous.items.length > 0 && previous.restaurantId !== restaurantId;
        if (hasOtherRestaurant) {
          return previous;
        }
        const existing = previous.items.find(
          (entry) => entry.menuItemId === item.id,
        );
        if (existing) {
          return {
            ...previous,
            restaurantId,
            restaurantName,
            items: previous.items.map((entry) =>
              entry.menuItemId === item.id
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry,
            ),
          };
        }
        return {
          restaurantId,
          restaurantName,
          items: [
            ...previous.items,
            {
              menuItemId: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
              image: item.image,
            },
          ],
        };
      });

      return {
        conflict: cart.items.length > 0 && cart.restaurantId !== restaurantId,
      };
    },
    [cart],
  );

  const removeItem = useCallback((menuItemId) => {
    setCart((previous) => {
      const items = withoutItem(previous.items, menuItemId);
      return items.length === 0 ? EMPTY_CART : { ...previous, items };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      // hitting 0 removes the line, same as removeItem (AGENTS.md conventions)
      setCart((previous) => {
        const items = withoutItem(previous.items, menuItemId);
        return items.length === 0 ? EMPTY_CART : { ...previous, items };
      });
      return;
    }
    setCart((previous) => ({
      ...previous,
      items: previous.items.map((entry) =>
        entry.menuItemId === menuItemId
          ? { ...entry, quantity: newQuantity }
          : entry,
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const setDeliveryFee = useCallback((fee) => {
    setCart((previous) => ({
      ...previous,
      deliveryFee: Number(fee) || 0,
    }));
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart.items],
  );

  const totalPrice = useMemo(
    () => cart.items.reduce((sum, entry) => sum + entry.quantity * entry.price, 0),
    [cart.items],
  );

  const value = useMemo(
    () => ({
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      deliveryFee: cart.deliveryFee,
      items: cart.items,
      totalItems,
      totalPrice,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setDeliveryFee,
    }),
    [
      cart,
      totalItems,
      totalPrice,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setDeliveryFee,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
