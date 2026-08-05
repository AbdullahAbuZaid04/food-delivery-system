// src/lib/mock/orders.js
// Mock order data for the "طلباتي" screen + the per-order tracking page
// (/orders/[id]) — UI-only, no real API (AGENTS.md §3, §11).
//
// Dates/timestamps are STATIC ISO strings anchored to the authoring day
// (2026-08-03): the orders routes are statically prerendered, so dates computed
// from `new Date()` at module load would drift between the server HTML (built
// once) and client hydration (recomputed on every visit) — same reason
// CartContext hydrates localStorage in a useEffect (AGENTS.md §2). When a real
// backend/API exists, replace this array with fetches instead of mixing static
// and live data in the same file.
//
// Per-order tracking fields (snapshot only — no real-time updates):
// - `items[].price` — unit price used by OrderSummaryCard (subtotal is derived
//   from items, delivery fee = total − subtotal, flat mock ٥ ₪ like checkout).
// - `deliveryAddress` — read-only display for the tracking page; `area` is one
//   of the names in `gazaAreas.js` (المناطق), `street` is the free-text street,
//   `phone` is the customer's contact phone (shown LTR, AGENTS.md §5).
// - `timeline` — the 4 fixed journey steps (تم التأكيد ← قيد التحضير ← بالطريق
//   ← وصل). `completed` is filled from `status`: everything up to the current
//   in-progress step is done, the current step (first non-completed) has a start
//   timestamp but `completed: false`, and future steps have no timestamp at all.
//   For "ملغي" the order was at least confirmed, so only step 1 is completed.
// - `courierName` / `courierPhone` — fake courier details, ONLY for orders with
//   status "بالطريق"; null everywhere else (the tracking page shows the
//   CourierInfoCard only then).
// - `estimatedDeliveryAt` — expected arrival time (12-hour format, Arabic
//   digits) shown on the tracking page for ACTIVE orders only (قيد التحضير /
//   بالطريق); null for delivered/cancelled ones.
// - `paymentMethod` / `paymentStatus` — read-only payment info. Method is always
//   CASH for now (card is still a disabled checkout teaser, AGENTS.md §11);
//   status is PENDING while the order is active, PAID once delivered, CANCELLED
//   for cancelled orders.
export const orders = [
  {
    id: "ord-1006",
    restaurantName: "مشاوي الأصيل",
    restaurantId: "al-azli",
    items: [
      { name: "كباب مشوي", quantity: 2, price: 28 },
      { name: "شيش طاووق", quantity: 1, price: 16 },
      { name: "ريش غنم", quantity: 1, price: 15 },
    ],
    total: 92,
    status: "قيد التحضير",
    date: "2026-08-03",
    deliveryArea: "الرمال",
    deliveryAddress: {
      area: "غزة",
      street: "حي الرمال، شارع الوحدة",
      phone: "0591234567",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-08-03T12:32:00", completed: true },
      {
        step: "قيد التحضير",
        timestamp: "2026-08-03T12:41:00",
        completed: false,
      },
      { step: "بالطريق", timestamp: null, completed: false },
      { step: "وصل", timestamp: null, completed: false },
    ],
    courierName: null,
    courierPhone: null,
    estimatedDeliveryAt: "2026-08-03T13:25:00",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
  },
  {
    id: "ord-1005",
    restaurantName: "بيتزا روزيتا",
    restaurantId: "roseeta-pizza",
    items: [
      { name: "بيتزا مارغريتا", quantity: 1, price: 30 },
      { name: "سندويش فاهيتا", quantity: 2, price: 13 },
    ],
    total: 61,
    status: "بالطريق",
    date: "2026-08-03",
    deliveryArea: "الشجاعية",
    deliveryAddress: {
      area: "غزة",
      street: "حي الشجاعية، قرب شارع النصر",
      phone: "0592345678",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-08-03T18:05:00", completed: true },
      {
        step: "قيد التحضير",
        timestamp: "2026-08-03T18:14:00",
        completed: true,
      },
      { step: "بالطريق", timestamp: "2026-08-03T18:47:00", completed: false },
      { step: "وصل", timestamp: null, completed: false },
    ],
    courierName: "سامر أبو هاشم",
    courierPhone: "0597771234",
    estimatedDeliveryAt: "2026-08-03T19:15:00",
    paymentMethod: "CASH",
    paymentStatus: "PENDING",
  },
  {
    id: "ord-1004",
    restaurantName: "مطعم بلدنا",
    restaurantId: "baladna",
    items: [
      { name: "مسخّن دجاج", quantity: 1, price: 32 },
      { name: "فته حمص", quantity: 1, price: 18 },
      { name: "منسف", quantity: 1, price: 19 },
    ],
    total: 74,
    status: "تم التوصيل",
    date: "2026-07-31",
    deliveryArea: "غزة",
    deliveryAddress: {
      area: "غزة",
      street: "شارع عمر المختار — وسط البلد",
      phone: "0593456789",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-07-31T13:20:00", completed: true },
      {
        step: "قيد التحضير",
        timestamp: "2026-07-31T13:26:00",
        completed: true,
      },
      { step: "بالطريق", timestamp: "2026-07-31T13:58:00", completed: true },
      { step: "وصل", timestamp: "2026-07-31T14:19:00", completed: true },
    ],
    courierName: null,
    courierPhone: null,
    estimatedDeliveryAt: null,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
  },
  {
    id: "ord-1003",
    restaurantName: "مطعم ومسمكة البحّار",
    restaurantId: "al-buhhar",
    items: [{ name: "صيادية", quantity: 2, price: 25 }],
    total: 55,
    status: "تم التوصيل",
    date: "2026-07-26",
    deliveryArea: "حي الرمال",
    deliveryAddress: {
      area: "غزة",
      street: "حي الرمال، شاطئ غزة",
      phone: "0594567890",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-07-26T19:02:00", completed: true },
      {
        step: "قيد التحضير",
        timestamp: "2026-07-26T19:08:00",
        completed: true,
      },
      { step: "بالطريق", timestamp: "2026-07-26T19:33:00", completed: true },
      { step: "وصل", timestamp: "2026-07-26T19:51:00", completed: true },
    ],
    courierName: null,
    courierPhone: null,
    estimatedDeliveryAt: null,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
  },
  {
    id: "ord-1002",
    restaurantName: "حلويات الزمن الجميل",
    restaurantId: "al-zaman-al-jamil",
    items: [
      { name: "كنافة نابلسية", quantity: 1, price: 19 },
      { name: "زنود الست", quantity: 2, price: 7 },
    ],
    total: 38,
    status: "ملغي",
    date: "2026-07-18",
    deliveryArea: "غزة",
    deliveryAddress: {
      area: "الوسطى",
      street: "دير البلح، شارع صلاح الدين",
      phone: "0595678901",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-07-18T12:45:00", completed: true },
      { step: "قيد التحضير", timestamp: null, completed: false },
      { step: "بالطريق", timestamp: null, completed: false },
      { step: "وصل", timestamp: null, completed: false },
    ],
    courierName: null,
    courierPhone: null,
    estimatedDeliveryAt: null,
    paymentMethod: "CASH",
    paymentStatus: "CANCELLED",
  },
  {
    id: "ord-1001",
    restaurantName: "مطعم التاج",
    restaurantId: "al-taj",
    items: [
      { name: "شاورما خروف", quantity: 3, price: 15 },
      { name: "شاورما دجاج", quantity: 1, price: 10 },
      { name: "سندويش لحم", quantity: 1, price: 8 },
    ],
    total: 68,
    status: "تم التوصيل",
    date: "2026-07-01",
    deliveryArea: "الرمال",
    deliveryAddress: {
      area: "خانيونس",
      street: "حي المنارة، شارع جمال عبد الناصر",
      phone: "0596789012",
    },
    timeline: [
      { step: "تم التأكيد", timestamp: "2026-07-01T20:10:00", completed: true },
      {
        step: "قيد التحضير",
        timestamp: "2026-07-01T20:18:00",
        completed: true,
      },
      { step: "بالطريق", timestamp: "2026-07-01T20:44:00", completed: true },
      { step: "وصل", timestamp: "2026-07-01T21:05:00", completed: true },
    ],
    courierName: null,
    courierPhone: null,
    estimatedDeliveryAt: null,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
  },
];
