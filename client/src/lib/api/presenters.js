import {
  Cake,
  Citrus,
  FishSymbol,
  Flame,
  Sandwich,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { formatDateTime, formatPrice, toArabicDigits } from "@lib/format";

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
// Pass `latin` (owner dashboard) to keep the digits Latin.
export function formatRating(rating, latin = false) {
  if (rating === null || rating === undefined || rating === "") return "جديد";
  const value = Number(rating);
  if (Number.isNaN(value)) return "جديد";
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return latin ? text : toArabicDigits(text.replace(".", "٫"));
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

// ========================
// OWNER DASHBOARD PRESENTERS
// ========================

// Granular status labels for the owner dashboard — unlike the customer app,
// the owner sees every stage of the journey, not the collapsed buckets.
export const OWNER_STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  ACCEPTED: "تم القبول",
  PREPARING: "قيد التحضير",
  READY: "جاهز",
  ASSIGNED: "تم تعيين سائق",
  PICKED_UP: "استلمه السائق",
  ON_THE_WAY: "بالطريق",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

export function ownerOrderStatusLabel(status) {
  return OWNER_STATUS_LABELS[status] ?? status;
}

// Mirrors the server's validTransitions (order.service.js) so the owner UI
// only offers legal next steps per status. READY is left empty on purpose:
// the next step for a ready order is assigning a driver (order.service.js
// requires status === "READY"), which the orders screen handles via a modal
// rather than a plain status button.
export const OWNER_STATUS_TRANSITIONS = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: [],
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["ON_THE_WAY"],
  ON_THE_WAY: ["DELIVERED"],
};

export function ownerNextActions(status) {
  return OWNER_STATUS_TRANSITIONS[status] ?? [];
}

export const STATUS_ACTION_LABELS = {
  ACCEPTED: "اقبل الطلب",
  PREPARING: "ابدأ التحضير",
  READY: "الطلب جاهز",
  ASSIGNED: "تعيين سائق",
  PICKED_UP: "استلمه السائق",
  ON_THE_WAY: "عالطريق",
  DELIVERED: "تم التوصيل",
  CANCELLED: "إلغاء الطلب",
};

export const MEAL_STATUS_LABELS = {
  AVAILABLE: "متاح",
  OUT_OF_STOCK: "نفذ",
  HIDDEN: "مخفي",
};

export const RESTAURANT_STATUS_LABELS = {
  OPEN: "مفتوح",
  CLOSED: "مغلق",
  SUSPENDED: "معلّق",
};

export const PAYMENT_LABELS = {
  CASH: "كاش عند الاستلام",
  CARD: "بطاقة ائتمان",
};

// Server order → owner order card shape (orders list + dashboard recent rows).
export function orderToOwnerCard(order) {
  const address = order.address ?? {};
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: ownerOrderStatusLabel(order.status),
    createdAt: order.createdAt,
    customerName: order.customer
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : "زبون",
    customerPhone: order.customer?.phone ?? order.phone ?? "",
    addressLine: [
      address.label,
      address.street,
      address.building,
      address.city,
      address.details,
    ]
      .filter(Boolean)
      .join("، "),
    items: (order.items ?? []).map((item) => ({
      name: item.mealName ?? item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? item.price,
    })),
    itemCount: (order.items ?? []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    ),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentLabel: PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod,
    notes: order.notes ?? "",
    driverName: order.driver
      ? `${order.driver.firstName} ${order.driver.lastName}`
      : null,
    driverPhone: order.driver?.phone ?? null,
    nextActions: ownerNextActions(order.status),
  };
}

// GET /dashboard → the view model for the overview screen.
const ACTIVE_ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
];

export function dashboardToView(stats) {
  const orders = stats.orders ?? {};
  const revenue = stats.revenue ?? {};
  const reviews = stats.reviews ?? {};
  const ordersByStatus = stats.ordersByStatus ?? {};
  return {
    orders,
    revenue,
    reviews,
    totalOrders: orders.total ?? 0,
    totalRevenue: Number(revenue.total ?? 0),
    averageRating: reviews.averageRating ?? null,
    activeOrders: ACTIVE_ORDER_STATUSES.reduce(
      (sum, status) => sum + (ordersByStatus[status] ?? 0),
      0,
    ),
    ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({
      status,
      label: ownerOrderStatusLabel(status),
      count,
    })),
    recentOrders: (stats.recentOrders ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      statusLabel: ownerOrderStatusLabel(order.status),
      customerName: order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : "زبون",
      itemNames: (order.items ?? [])
        .map((item) => item.mealName)
        .filter(Boolean),
      itemCount: (order.items ?? []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      ),
      createdAt: order.createdAt,
    })),
  };
}

// Server review → owner review card shape.
export function reviewToOwnerCard(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment ?? "",
    customerName: review.customer
      ? `${review.customer.firstName} ${review.customer.lastName}`
      : "زبون",
    createdAt: review.createdAt,
  };
}

// Server restaurant → the settings/setup form state.
export function restaurantToOwnerForm(restaurant) {
  const address = restaurant.address ?? {};
  return {
    name: restaurant.name ?? "",
    description: restaurant.description ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    cuisine: restaurant.cuisine ?? "",
    logoUrl: restaurant.logoUrl ?? "",
    coverImageUrl: restaurant.coverImageUrl ?? "",
    deliveryFee: restaurant.deliveryFee ?? 0,
    minimumOrder: restaurant.minimumOrder ?? 0,
    estimatedDeliveryTime: restaurant.estimatedDeliveryTime ?? 30,
    address: {
      label: address.label ?? "",
      city: address.city ?? "",
      street: address.street ?? "",
      building: address.building ?? "",
      details: address.details ?? "",
    },
  };
}

// The owner form state → the create/update payload the server expects. Optional
// URL/string fields that are empty become undefined so zod's .optional() lets
// them through (server defaults kick in where relevant).
export function restaurantFormToPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    phone: form.phone.trim(),
    email: form.email.trim() || undefined,
    cuisine: form.cuisine.trim() || undefined,
    logoUrl: form.logoUrl.trim() || undefined,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    deliveryFee: Number(form.deliveryFee) || 0,
    minimumOrder: Number(form.minimumOrder) || 0,
    estimatedDeliveryTime: Number(form.estimatedDeliveryTime) || undefined,
    address: {
      label: form.address.label.trim(),
      city: form.address.city.trim(),
      street: form.address.street.trim(),
      building: form.address.building.trim() || undefined,
      details: form.address.details.trim() || undefined,
    },
  };
}

// Re-export for reuse across the owner dashboard. The dashboard uses Latin
// digits (AGENTS.md §5 dashboard exception), so formatDateTime runs in its
// `latin` mode here.
export function formatOwnerDateTime(iso) {
  return formatDateTime(iso, true);
}

// ========================
// DRIVER DASHBOARD PRESENTERS
// ========================

// The single legal next step per status for the driver (mirrors the server's
// driverTransitions in order.service.js). The driver only moves the delivery
// leg forward once the owner has assigned them the order — the UI shows one
// action per status, no branching.
export const DRIVER_STATUS_TRANSITIONS = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["ON_THE_WAY"],
  ON_THE_WAY: ["DELIVERED"],
};

export function driverNextAction(status) {
  return DRIVER_STATUS_TRANSITIONS[status]?.[0] ?? null;
}

export const DRIVER_ACTION_LABELS = {
  PICKED_UP: "استلمت الطلبية",
  ON_THE_WAY: "بالطريق هلق",
  DELIVERED: "تم التسليم",
};

export function driverActionLabel(status) {
  return DRIVER_ACTION_LABELS[status] ?? null;
}

// Server order → driver card shape (driver orders list + detail). Reuses
// ownerOrderStatusLabel so the same Arabic label set covers every stage.
export function orderToDriverCard(order) {
  const address = order.address ?? {};
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: ownerOrderStatusLabel(order.status),
    createdAt: order.createdAt,
    restaurantName: order.restaurant?.name ?? "مطعم",
    restaurantPhone: order.restaurant?.phone ?? "",
    customerName: order.customer
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : "زبون",
    customerPhone: order.customer?.phone ?? order.phone ?? "",
    addressLine: [
      address.label,
      address.street,
      address.building,
      address.city,
      address.details,
    ]
      .filter(Boolean)
      .join("، "),
    items: (order.items ?? []).map((item) => ({
      name: item.mealName ?? item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? item.price,
    })),
    itemCount: (order.items ?? []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    ),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentLabel: PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod,
    notes: order.notes ?? "",
    nextAction: driverNextAction(order.status),
    nextActionLabel: driverActionLabel(driverNextAction(order.status)),
  };
}

// ========================
// ADMIN DASHBOARD PRESENTERS
// ========================

export const ADMIN_USER_STATUS_LABELS = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  BLOCKED: "محظور",
};

export function adminUserStatusLabel(status) {
  return ADMIN_USER_STATUS_LABELS[status] ?? status;
}

export function adminRestaurantStatusLabel(status) {
  return RESTAURANT_STATUS_LABELS[status] ?? status;
}

// Server user → admin list/detail card shape. Reuses RESTAURANT_STATUS_LABELS
// for restaurants below (already defined in the owner section).
export function adminUserToCard(user) {
  return {
    id: user.id,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "مستخدم",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role?.name ?? "",
    status: user.status,
    statusLabel: adminUserStatusLabel(user.status),
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt,
  };
}

export function adminUserToDetail(user) {
  const card = adminUserToCard(user);
  return {
    ...card,
    lastLoginAt: user.lastLoginAt ?? null,
    addresses: (user.addresses ?? []).map((a) =>
      [a.label, a.street, a.building, a.city, a.details]
        .filter(Boolean)
        .join("، "),
    ),
  };
}

export function adminRestaurantToCard(restaurant) {
  return {
    id: restaurant.id,
    name: restaurant.name ?? "مطعم",
    cuisine: restaurant.cuisine ?? "",
    status: restaurant.status,
    statusLabel:
      RESTAURANT_STATUS_LABELS[restaurant.status] ?? restaurant.status,
    ownerName: restaurant.owner
      ? `${restaurant.owner.firstName ?? ""} ${restaurant.owner.lastName ?? ""}`.trim() ||
        "مالك"
      : "—",
    ownerEmail: restaurant.owner?.email ?? "",
    createdAt: restaurant.createdAt,
  };
}

export function adminRestaurantToDetail(restaurant) {
  const card = adminRestaurantToCard(restaurant);
  const address = restaurant.address ?? {};
  return {
    ...card,
    ownerId: restaurant.owner?.id ?? null,
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    estimatedDeliveryTime: restaurant.estimatedDeliveryTime ?? null,
    addressLine: [address.label, address.street, address.building, address.city, address.details]
      .filter(Boolean)
      .join("، "),
    counts: restaurant._count ?? { categories: 0, meals: 0, orders: 0, reviews: 0 },
  };
}
