import {
  Cake,
  Citrus,
  FishSymbol,
  Flame,
  Sandwich,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { formatPrice, toArabicDigits } from "@lib/format";

// Presenters — convert API payloads (src/lib/api) into the presentation shapes
// the existing UI components expect (RestaurantCard, RestaurantHeader,
// MenuItemCard). This keeps components presentational and avoids mixing static
// and live data (AGENTS.md §3).

export const DEFAULT_MEAL_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&auto=format&fit=crop";

export const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop";

const CUISINE_VISUALS = [
  {
    test: /مشاوي|فحم|شاورما/,
    icon: <Flame className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-terra/12 text-terra-dark",
  },
  {
    test: /بحري|بحر|سمك/,
    icon: <FishSymbol className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-olive/14 text-olive",
  },
  {
    test: /بيتزا|سندويش|بيتا|فلافل/,
    icon: <Sandwich className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-clay",
  },
  {
    test: /شعبي|مقلوبة|مسخن|كبسة/,
    icon: <UtensilsCrossed className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-terra/12 text-terra",
  },
  {
    test: /حلويات|كنافة/,
    icon: <Cake className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-terra-dark",
  },
  {
    test: /عصائر|كوكتيل/,
    icon: <Citrus className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-clay",
  },
];

const DEFAULT_VISUAL = {
  icon: <Store className="w-6 h-6" strokeWidth={1.7} />,
  tone: "bg-terra/12 text-terra",
};

function visualForCuisine(cuisine) {
  const match = CUISINE_VISUALS.find((entry) => entry.test.test(cuisine ?? ""));
  return match ?? DEFAULT_VISUAL;
}

// "4" / "4.6" → "٤" / "٤٫٦" (Arabic-Indic digits, AGENTS.md §5); no rating → "جديد".
export function formatRating(rating) {
  if (rating === null || rating === undefined || rating === "") return "جديد";
  const value = Number(rating);
  if (Number.isNaN(value)) return "جديد";
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return toArabicDigits(text.replace(".", "٫"));
}

export function formatDeliveryFee(fee) {
  const value = Number(fee) || 0;
  if (value <= 0) return "توصيل مجاني";
  return `توصيل ${formatPrice(value)}`;
}

export function restaurantToCard(restaurant) {
  const cuisine = restaurant.cuisine ?? "";
  const visual = visualForCuisine(cuisine);
  const timeMinutes = restaurant.estimatedDeliveryTime ?? 40;
  return {
    id: restaurant.slug,
    icon: visual.icon,
    tone: visual.tone,
    name: restaurant.name,
    cuisine,
    category: cuisine,
    rating: formatRating(restaurant.rating),
    time: `${toArabicDigits(timeMinutes)} د`,
    delivery: formatDeliveryFee(restaurant.deliveryFee),
    dishes: Array.isArray(restaurant.dishes) ? restaurant.dishes : [],
  };
}

export function mealToCard(meal) {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description ?? "",
    image: meal.imageUrl || DEFAULT_MEAL_IMAGE,
    price: meal.price,
    isAvailable: meal.status === "AVAILABLE",
  };
}

// Server order → the presentation shape the confirmation screen renders.
// Server order items are { mealId, mealName, quantity, unitPrice, notes } and
// the address uses { label, city, street, building, details } — mapped here so
// the confirmation UI keeps reading the shape it was built for.
export function orderToConfirm(order) {
  const address = order.address ?? {};
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    restaurantName: order.restaurant?.name,
    items: (order.items ?? []).map((item) => ({
      menuItemId: item.mealId,
      name: item.mealName ?? item.name,
      quantity: item.quantity,
      price: item.unitPrice ?? item.price,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    address: {
      area: address.city,
      neighborhood: address.street,
      landmark: address.building,
      details: address.details,
    },
    phone: order.phone,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    estimatedDeliveryAt: order.estimatedDeliveryAt,
  };
}

// Server OrderStatus enums → the Arabic labels the UI renders everywhere.
// The UI only distinguishes four buckets, so several server statuses collapse
// onto the same label (AGENTS.md §5 colloquial tone).
const ORDER_STATUS_LABELS = {
  PENDING: "قيد التحضير",
  ACCEPTED: "قيد التحضير",
  PREPARING: "قيد التحضير",
  READY: "بالطريق",
  ASSIGNED: "بالطريق",
  PICKED_UP: "بالطريق",
  ON_THE_WAY: "بالطريق",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderIsActive(order) {
  return order.status !== "DELIVERED" && order.status !== "CANCELLED";
}

// Canonical journey phases → the minimum server statuses that complete each
// phase. Used to derive the shared progress/timeline visuals from a server
// order's statusHistory (the UI never sees raw enums).
const TIMELINE_PHASES = [
  { step: "تم التأكيد", statuses: ["PENDING"], completeAt: 0 },
  {
    step: "قيد التحضير",
    statuses: ["ACCEPTED", "PREPARING"],
    completeAt: 2,
  },
  {
    step: "بالطريق",
    statuses: ["READY", "ASSIGNED", "PICKED_UP", "ON_THE_WAY"],
    completeAt: 6,
  },
  { step: "وصل", statuses: ["DELIVERED"], completeAt: 7 },
];

const STATUS_ORDER = {
  PENDING: 0,
  ACCEPTED: 1,
  PREPARING: 2,
  READY: 3,
  ASSIGNED: 4,
  PICKED_UP: 5,
  ON_THE_WAY: 6,
  DELIVERED: 7,
};

export function buildOrderTimeline(statusHistory = [], currentStatus) {
  const currentIndex = STATUS_ORDER[currentStatus] ?? 0;
  const latestByStatus = new Map();
  for (const entry of statusHistory) {
    const existing = latestByStatus.get(entry.status);
    if (!existing || new Date(entry.changedAt) > new Date(existing)) {
      latestByStatus.set(entry.status, entry.changedAt);
    }
  }

  return TIMELINE_PHASES.map((phase) => {
    const timestamps = phase.statuses
      .map((status) => latestByStatus.get(status))
      .filter(Boolean)
      .sort();
    return {
      step: phase.step,
      timestamp: timestamps[timestamps.length - 1] ?? null,
      completed: currentIndex >= phase.completeAt,
    };
  });
}

// Server order → the OrderHistoryCard shape for the "طلباتي" list.
// Items carry the full reorder payload (menuItemId/price/image from the loaded
// meal relation) so "اطلب نفس الطلبية" can refill CartContext without another
// request. Older orders without a meal relation fall back to mealName/mealId.
export function orderToHistoryCard(order) {
  const address = order.address ?? {};
  return {
    id: order.id,
    restaurantName: order.restaurant?.name,
    restaurantId: order.restaurant?.id,
    restaurantSlug: order.restaurant?.slug,
    deliveryFee: Number(order.deliveryFee) || 0,
    status: orderStatusLabel(order.status),
    date: (order.createdAt ?? "").slice(0, 10),
    deliveryArea: address.city ?? "",
    items: (order.items ?? []).map((item) => {
      const meal = item.meal ?? {};
      return {
        menuItemId: item.mealId ?? meal.id,
        name: meal.name ?? item.mealName ?? item.name,
        quantity: item.quantity,
        price: Number(item.unitPrice ?? meal.price ?? item.price) || 0,
        image: meal.imageUrl || DEFAULT_MEAL_IMAGE,
      };
    }),
    total: order.total,
  };
}

// Server order → the OrderTrackingView shape (progress + courier + address +
// payment + items, all mapped off the raw enums and relations).
export function orderToTracking(order) {
  const address = order.address ?? {};
  const statusHistory = order.statusHistory ?? [];
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    restaurantName: order.restaurant?.name,
    status: orderStatusLabel(order.status),
    timeline: buildOrderTimeline(statusHistory, order.status),
    courierName: order.driver
      ? `${order.driver.firstName} ${order.driver.lastName}`
      : null,
    courierPhone: order.driver?.phone ?? null,
    deliveryAddress: {
      area: address.city ?? "",
      street:
        [address.street, address.building, address.details]
          .filter(Boolean)
          .join(" — ") || "—",
      phone: order.phone ?? "",
    },
    items: (order.items ?? []).map((item) => ({
      menuItemId: item.mealId,
      name: item.mealName ?? item.name,
      quantity: item.quantity,
      price: item.unitPrice ?? item.price,
    })),
    total: order.total,
    estimatedDeliveryAt: order.estimatedDeliveryAt ?? null,
    paymentMethod: order.paymentMethod ?? "CASH",
    paymentStatus: order.paymentStatus ?? "PENDING",
  };
}
