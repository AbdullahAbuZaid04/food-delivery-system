"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { restaurantApi } from "@lib/api";

// OwnerContext — the current owner's restaurant, loaded once per dashboard
// session. The layout owns the provider; every owner page reads `restaurant`
// for its restaurantId/name and `reloadRestaurant` to refresh after edits.
// A missing restaurant (server 404) is represented as `restaurant: null` so the
// dashboard can render the setup screen instead of an error.

const OwnerContext = createContext(null);

export function OwnerProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState(null);

  const reloadRestaurant = useCallback(async () => {
    setRestaurantLoading(true);
    setRestaurantError(null);
    try {
      const data = await restaurantApi.getMyRestaurant();
      setRestaurant(data);
    } catch (error) {
      if (error?.status === 404) {
        setRestaurant(null);
      } else {
        setRestaurantError(
          error.message || "تعذر تحميل بيانات المطعم، حاول مرة تانية.",
        );
      }
    } finally {
      setRestaurantLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reloadRestaurant();
  }, [reloadRestaurant]);

  const value = useMemo(
    () => ({ restaurant, restaurantLoading, restaurantError, reloadRestaurant }),
    [restaurant, restaurantLoading, restaurantError, reloadRestaurant],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error("useOwner must be used within an <OwnerProvider>");
  }
  return context;
}
