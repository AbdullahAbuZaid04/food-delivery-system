// src/lib/mock/orders.js
// Mock order-history data for the "طلباتي" screen (UI-only, AGENTS.md §3).
// Dates are STATIC ISO strings anchored to the authoring day (2026-08-03):
// /orders is a statically prerendered route, so dates computed from
// `new Date()` at module load would drift between the server HTML (built once)
// and client hydration (recomputed on every visit) — same reason CartContext
// hydrates localStorage in a useEffect (AGENTS.md §2). The two newest orders
// land on the authoring day so the "اليوم/أمس" formatter stays meaningful for a
// while; when a real backend/API exists, replace this array with fetches
// instead of mixing static and live data in the same file.
export const orders = [
  {
    id: "ord-1006",
    restaurantName: "مشاوي الأصيل",
    restaurantId: "al-azli",
    items: [
      { name: "كباب مشوي", quantity: 2 },
      { name: "شيش طاووق", quantity: 1 },
      { name: "ريش غنم", quantity: 1 },
    ],
    total: 92,
    status: "قيد التحضير",
    date: "2026-08-03",
    deliveryArea: "الرمال",
  },
  {
    id: "ord-1005",
    restaurantName: "بيتزا روزيتا",
    restaurantId: "roseeta-pizza",
    items: [
      { name: "بيتزا مارغريتا", quantity: 1 },
      { name: "سندويش فاهيتا", quantity: 2 },
    ],
    total: 61,
    status: "بالطريق",
    date: "2026-08-03",
    deliveryArea: "الشجاعية",
  },
  {
    id: "ord-1004",
    restaurantName: "مطعم بلدنا",
    restaurantId: "baladna",
    items: [
      { name: "مسخّن دجاج", quantity: 1 },
      { name: "فته حمص", quantity: 1 },
      { name: "منسف", quantity: 1 },
    ],
    total: 74,
    status: "تم التوصيل",
    date: "2026-07-31",
    deliveryArea: "غزة",
  },
  {
    id: "ord-1003",
    restaurantName: "مطعم ومسمكة البحّار",
    restaurantId: "al-buhhar",
    items: [{ name: "صيادية", quantity: 2 }],
    total: 55,
    status: "تم التوصيل",
    date: "2026-07-26",
    deliveryArea: "حي الرمال",
  },
  {
    id: "ord-1002",
    restaurantName: "حلويات الزمن الجميل",
    restaurantId: "al-zaman-al-jamil",
    items: [
      { name: "كنافة نابلسية", quantity: 1 },
      { name: "زنود الست", quantity: 2 },
    ],
    total: 38,
    status: "ملغي",
    date: "2026-07-18",
    deliveryArea: "غزة",
  },
  {
    id: "ord-1001",
    restaurantName: "مطعم التاج",
    restaurantId: "al-taj",
    items: [
      { name: "شاورما خروف", quantity: 3 },
      { name: "شاورما دجاج", quantity: 1 },
      { name: "سندويش لحم", quantity: 1 },
    ],
    total: 68,
    status: "تم التوصيل",
    date: "2026-07-01",
    deliveryArea: "الرمال",
  },
];
