# AGENTS.md — وجبة (Wajba)

This file defines the conventions any AI agent (Claude, Cursor, Copilot, etc.) or
human contributor MUST follow anywhere in this repository — not just the landing
page. Read this before making any change. If a request conflicts with this file,
flag the conflict instead of silently deviating. If a section doesn't yet apply
because that part of the product doesn't exist yet, follow it anyway once that
part gets built — this file is meant to scale with the project, not be rewritten
per feature.

---

## 1. Project Overview

- **Product**: "وجبة" (Wajba) — a food delivery platform for restaurants in the
  Gaza Strip. Today the repo contains the public marketing landing page; the
  platform is expected to grow into a full ordering product (restaurant listings,
  menus, cart, checkout, order tracking, auth, and possibly a restaurant-facing
  dashboard).
- **Audience**: Arabic-speaking, RTL-first, across the whole product — not just
  the homepage. Every future page (restaurant page, cart, checkout, account,
  dashboard) inherits the same language and design rules below.
- **Current state**: `app/page.js` (landing page) is the only real route. Treat
  it as the reference implementation for patterns (RTL handling, accessibility,
  component structure) — new routes should match its conventions, not reinvent them.

## 2. Tech Stack

- Next.js (App Router). Route structure lives under `app/`. New pages = new
  folders under `app/` following Next.js file conventions (`page.js`, `layout.js`,
  `loading.js`, `error.js` as needed) — don't introduce Pages Router patterns.
- Tailwind CSS v4 — theme is defined via `@theme inline` in `app/globals.css`.
  **There is no `tailwind.config.js` and there should not be one.** Add new design
  tokens inside `@theme inline`, globally, so every route can use them.
- Icons: `lucide-react` only, project-wide. Do not introduce a second icon library.
- Fonts via `next/font/google`, loaded once in the root `app/layout.js`:
  `Tajawal` (body), `Cairo` (`--font-display`, used for all headings across the
  product), `Inter` (reserved for Latin/numeric UI, e.g. future admin dashboard).
  Any nested layout must inherit these — don't re-load fonts per route.
- `react-hot-toast` (`<Toaster />`, mounted once in root layout) is the
  project-wide toast/notification mechanism — use it for cart actions, form
  submissions, auth errors, etc. Don't add a second toast library.
- Cart state is shared app-wide via React Context only
  (`src/context/CartContext.jsx` — `CartProvider` + `useCart()`), persisted to
  `localStorage` under the `wajba-cart` key (hydrated in a `useEffect` to avoid
  SSR hydration mismatches). A cart holds items from ONE restaurant at a time:
  `addItem()` returns `{ conflict: true }` when the caller tries to add from a
  different restaurant and the decision (clear vs. keep) is left to the UI via
  `RestaurantConflictModal` — the context never mutates on conflict. No external
  state library (Zustand or otherwise) — this is the documented decision
  (§10); if it ever changes, update this file.
- **Data layer**: the client talks to the Express REST API in `../server/`
  (port 5000 during development; base URL comes from `NEXT_PUBLIC_API_URL`,
  defaulting to `http://localhost:5000/api`). All requests go through the
  shared API client in `src/lib/api/` (one `client.js` axios instance with
  interceptors + per-domain modules: `auth`, `restaurants`, `meals`,
  `categories`, `orders`, `cart`, `addresses`) — never call `fetch`/`axios`
  directly from components or pages, and never bypass the envelope. The server
  wraps every response: success is `{ success: true, data: ... }`, errors are
  `{ success: false, message }` with the matching HTTP status
  (400/401/403/404); the API client unwraps `data` on success and throws on
  failure. Auth is bearer-token based (`Authorization: Bearer <accessToken>`)
  with automatic refresh via `POST /api/auth/refresh`; customer endpoints
  require the `CUSTOMER` role. Server money/Decimal fields arrive as strings
  (`deliveryFee`, `total`, `price`, …) and are normalized to numbers inside
  the API layer before reaching components.
- Auth + cart state stay in React Context (`src/context/AuthContext.jsx`,
  `src/context/CartContext.jsx`). `zustand` remains installed but unused — the
  Context-only decision in §10 stands. Restaurant URLs stay slug-based
  (`/restaurants/:slug`) exactly as the seed fixtures use; keep the mock data
  under `src/lib/mock/` as the reference shapes until each screen is
  converted, then remove it — don't mix static and live data in one file.

## 3. Repository Structure Conventions

```
app/
  layout.js          → root layout: fonts, global metadata, <Toaster/>
  globals.css         → design tokens (@theme inline), global CSS, animations
  page.js             → landing page (marketing homepage)
  [future routes]/    → e.g. app/restaurants/[slug]/page.js, app/cart/page.js
components/           → shared, reusable components used across 2+ routes
                         (once a component is needed outside page.js, move it here)
lib/ or utils/        → shared helpers (formatting, API clients) — create when
                         first needed, don't pre-scaffold empty folders
```
- Components used only inside one page can stay colocated at the top of that
  page's file (as done today in `page.js`). Once a component is reused across
  routes, extract it into `components/` and import it — don't duplicate it.
- Keep data arrays (restaurant lists, menu items, etc.) as plain JS/JSON near
  where they're used until there's a real data source; when a backend/API
  exists, replace them with fetches rather than mixing static and live data
  in the same file.

## 4. Design System — Applies to Every Route

All colors are defined once in `app/globals.css` under `@theme inline` and must
be reused everywhere in the product — landing page, restaurant pages, cart,
checkout, dashboard, emails if HTML emails are ever built. Never hardcode hex
values or fall back to default Tailwind palette colors (`red-500`, `blue-600`, etc.)
anywhere in this repo.

| Token | Use |
|---|---|
| `terra` / `terra-dark` | Primary brand color — CTAs, links, active states |
| `cocoa` / `cocoa-soft` | Primary text / secondary text |
| `cream` / `cream-deep` / `parchment` | Backgrounds |
| `olive` / `olive-deep` / `olive-light` | Secondary/dark sections |
| `gold` / `gold-soft` | Accents, ratings, dividers |
| `clay` | Borders, muted icon tones |
| `error` / `success` / `warning` | Status colors — use for toasts, form validation, order status badges, anywhere in the app |

Generic tokens (`primary`, `secondary`, `background`, `foreground`, `muted`,
`border`) exist for non-marketing UI (dashboards, forms, account settings) —
keep this token set and the marketing token set conceptually separate, but both
come from the same `@theme inline` block; don't create a second theme file.

**Typography rule (project-wide)**: headings/display text → `font-display`
(Cairo). Body text → default (Tajawal). This applies to every page, not just
the homepage.

**Radius/spacing rule**: reuse the radii already established (`rounded-2xl`,
`rounded-[24px]`, `rounded-full`) and the container pattern
`max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6` for any new full-width
section on any page.

## 5. RTL & Language Rules — Applies to Every Route

- The whole app is RTL (`<html dir="rtl" lang="ar">` set once in root layout).
  Every new page inherits this — never override `dir` except for isolated LTR
  content (emails, phone numbers, prices in Latin digits if ever needed, embedded
  LTR widgets).
- All visible numbers use **Arabic-Indic digits** (٠١٢٣٤٥٦٧٨٩), not Latin digits —
  this applies to prices, order counts, ratings, dashboard stats, everywhere.
  **Exception — business dashboards (owner + driver)**: `/owner/*` and `/driver/*`
  use Latin digits for business data
  (prices, quantities, order numbers, phone numbers, ratings) — decided by the
  owner product decision for POS-style clarity. The shared formatters take a
  `latin` flag rather than duplicating logic: `formatPrice(value, true)`,
  `formatDateTime(iso, true)`, `formatRating(rating, true)`; `formatOwnerDateTime`
  (presenters.js) already defaults to Latin.
- Copy tone: warm, colloquial, Palestinian dialect (لهجة فلسطينية عامية), not
  formal MSA. This applies to every user-facing string in the product — error
  messages, empty states, button labels, confirmation emails — not just marketing
  copy. Match the tone already established in the landing page.
- Directional icons follow RTL semantics everywhere: "next"/"forward" →
  `ChevronLeft`, "previous"/"back" → `ChevronRight`. Apply this consistently in
  any future pagination, stepper, or wizard flow (e.g. checkout steps).

## 6. Component Conventions

- Small, single-purpose components (badges, cards, star ratings, section
  ornaments) over large monolithic page files. This pattern should continue as
  new pages are built, not just on the homepage.
- Data-driven UI: model repeated content as arrays of plain objects rendered via
  `.map()`, whether that's restaurant cards today or order-history rows tomorrow.
  Don't hardcode repeated JSX blocks for what is structurally a list.
- Any new interactive component (carousel, accordion, tabs, stepper, modal) follows
  the pattern already used in the landing page's testimonial carousel and mobile
  menu:
  - `useState`/`useReducer` for local state — no external UI/carousel library
    unless a real need (e.g. complex forms) justifies adding one, and that
    addition should be discussed, not silently introduced.
  - Full ARIA roles/labels, `aria-live` for dynamically changing content,
    `aria-current`/`aria-expanded`/`aria-modal` as appropriate.
  - Keyboard support (Tab, Enter/Space, Escape) and touch/swipe support where
    relevant on mobile.
  - `min-height` or skeletons around content whose length varies, to avoid
    layout shift.

## 7. Accessibility — Non-Negotiable, Every Route

- [ ] Minimum 44×44px touch target for buttons/icon-only controls.
- [ ] Visible `aria-label` on any icon-only control.
- [ ] Full keyboard operability; `Escape` closes any overlay/modal.
- [ ] Focus trap inside any full-screen modal/menu/drawer (see the mobile menu
  in `page.js` as the reference implementation).
- [ ] Respect `prefers-reduced-motion` — this applies differently depending on
  where the animation comes from:
  - **Custom keyframes** (`animate-float`, `animate-menu-in`, `animate-rise`,
    etc., defined in `globals.css`) → register them in the existing
    `@media (prefers-reduced-motion: reduce)` block in `globals.css`. Don't add
    a new custom keyframe without adding it there too.
  - **Tailwind's built-in animation utilities** (`animate-pulse`, `animate-spin`,
    `animate-bounce`, etc.) → these are NOT covered by the `globals.css` media
    query since they're not custom keyframes. Guard them inline instead, using
    Tailwind's `motion-reduce:` variant directly on the element, e.g.
    `className="animate-pulse motion-reduce:animate-none"` (see `loading.js`
    for the reference implementation).
- [ ] No information conveyed by color alone (status badges, active states, form
  errors must also carry text or an icon, not just a color change).
- This checklist applies to every future page — cart, checkout, account, order
  tracking, restaurant dashboard — with zero exceptions for being "internal" or
  "just an admin tool."

## 8. Responsive Rules — Every Route

- Breakpoints in use: default (< 640px), `sm:` 640px, `md:` 768px, `lg:` 1024px,
  `xl:` 1280px. Don't introduce arbitrary custom breakpoints without adding them
  here first, project-wide.
- **Never position decorative floating elements with negative absolute offsets
  (`-right-*`, `-left-*`) without a near-zero fallback under ~400px viewport
  width.** This project already hit and fixed this bug once (hero floating
  badges) — don't reintroduce it in new pages.
- Test every new page/component mentally (or via devtools) at 320px, 375px,
  768px, 1024px, 1440px, 1920px before considering it done — this applies to
  every route added to the product, not just marketing pages.

## 9. SEO & Metadata — Project-Wide

- `app/layout.js` owns global `<metadata>` defaults (title template, description,
  OpenGraph, Twitter, `metadataBase`). Every new route should export its own
  `metadata` that extends — not duplicates — these defaults (e.g. a restaurant
  page sets its own title/description/OG image, but inherits siteName, locale,
  Twitter card type from root).
- Add `metadataBase: new URL("https://wajba.ps")` to the root `metadata` export
  if not already present — required for reliable OG image resolution across all
  routes, especially any route using relative image paths.
- Structured data (JSON-LD): the `organizationSchema` in the landing page is the
  project-wide organization identity. If restaurant pages are added, give each
  one its own `Restaurant`/`LocalBusiness` schema rather than repeating the
  organization schema.

## 10. Coding & Git Conventions

- `"use client"` only on components that actually need hooks/browser APIs; keep
  server components as the default across new routes for performance.
- No inline hex colors, no inline `px` magic numbers where a design token or
  existing spacing scale value already covers the case.
- Comment non-obvious fixes at the point of the fix (see the `.grain` z-index
  comment in `globals.css` as the reference style) — explain the problem being
  solved, not just what the code does.
- Keep this file (`AGENTS.md`) updated whenever a new architectural decision is
  made (data layer, auth provider, payment provider, state management library) —
  it should always reflect the real, current conventions of the repo.

## 11. Known Placeholders / Cross-Cutting TODOs

- [ ] `HERO_IMAGE` (Unsplash stock photo), used as both the hero visual and the
  `organizationSchema.logo` — replace with real, licensed photography before
  production launch, project-wide (any other stock imagery introduced later
  should be tracked here too).
- [ ] Footer phone number `0590000000` and `support@wajba.ps` — confirm these
  are real, live contact channels before publishing.
- [ ] ~~Header cart icon has no item-count state~~ — DONE: `AppHeader` now reads
  `useCart()` directly and its cart icon is a `Link` to `/cart`, so every screen
  (home, restaurant, cart) shows the real cart count. Note: the old fixed
  `CartSummaryBar` ("اطلب الآن") was removed from the restaurant page — the
  header icon is now the only entry point to the cart.
- [ ] Hero floating trust badges (١٢٠ مطعم / ٤٫٩ تقييم / ٢٥ دقيقة توصيل) were
  removed during a responsiveness fix — restore using the safe positioning
  pattern in section 8 before treating the homepage as final.
- [ ] ~~Checkout + order-confirmation are UI-only this phase~~ — DONE
  (`feature/api-integration`): checkout mirrors the client cart into the
  SERVER-side cart, calls `POST /api/orders` (createOrder builds the order from
  the server cart, then clears it), and navigates to
  `/order-confirmation?order=<id>`; the confirmation screen re-fetches that
  order via `GET /api/orders/:id` (`useSearchParams` behind a `<Suspense>`
  boundary) and renders `orderToConfirm(order)`. The old `wajba-last-order`
  localStorage key and fake `WB-` order numbers are gone — order numbers come
  from the server (`ORD-…`). Remaining: بطاقة ائتمان is still a disabled teaser
  card with a "قريبًا" badge (no e-payment logic yet) and CASH is the only real
  payment method; the delivery fee is the restaurant's real `deliveryFee` from
  the API, not a flat mock.
- [ ] ~~The orders screens (`src/app/(customer)/orders/` + the per-order tracking
  page `/orders/[id]`) are UI-only this phase~~ — DONE (`feature/api-integration`):
  "طلباتي" fetches `GET /api/orders/my` and maps through `orderToHistoryCard`
  (server order number, real statuses/totals); the tracking page is a Client
  Component that fetches `GET /api/orders/:id` and renders the shared
  `OrderTrackingView` via `orderToTracking` (progress timeline derived from the
  order's `statusHistory`, real courier name/phone when a driver is assigned).
  **Customer flow steps (`feature/real-time-orders`)**: the progress timeline is
  now driven by real actions — "تم التأكيد" lights on the owner accepting
  (`ACCEPTED`), "قيد التحضير" on the owner pressing تحضير (`PREPARING`),
  "بالطريق" only when the driver reports on-the-way (`ON_THE_WAY`), and "وصل" on
  delivery (`DELIVERED`) — intermediate statuses (READY/ASSIGNED/PICKED_UP)
  leave the upcoming step unlit. Badge labels follow the same split: PENDING →
  "بانتظار تأكيد المطعم", ACCEPTED → "تم التأكيد", PREPARING/READY →
  "قيد التحضير", ASSIGNED/PICKED_UP/ON_THE_WAY → "بالطريق". Presenters expose
  the raw server status as `statusCode` and all logic that used to branch on
  Arabic labels (cancel visibility, active-card link, ETA) now branches on
  `statusCode` — never compare labels in logic.
  `LastOrderTracking` and `src/lib/mock/orders.js` were deleted. The "إلغاء
  الطلب" button (shown for server PENDING/ACCEPTED, the only
  cancellable statuses) is now real: it opens a confirmation **modal**
  (`CancelOrderModal`, same `role="alertdialog"`/focus-trap/Escape pattern as
  `ClearCartDialog` — AGENTS.md §7) whose confirm button calls
  `PATCH /api/orders/:id/cancel`, then the order is refetched and re-rendered
  as "ملغي". "اطلب نفس
  الطلبية" is now real: `GET /api/orders/my` enriches every item with its meal
  (`id`/`name`/`price`/`imageUrl`) plus the restaurant `slug`, and
  `OrderHistoryCard` refills `CartContext` (clears the cart, sets the order's
  `deliveryFee`, re-adds each item) then navigates to `/restaurants/:slug`.
  Guard rails (so reorder can't build a cart that checkout can't submit):
  `handleReorder` refuses items whose `menuItemId` isn't a real meal link
  ("ما بنقدر نعيد نفس الطلبية لهالطلب — المنيو تغيّر"), and `CartContext`
  hydration drops persisted entries that lack a valid `menuItemId` string
  (self-heals stale carts that would otherwise POST `/cart/items` with
  `mealId: undefined` → "Invalid input: expected string, received undefined").
  The demo seed orders (`ORD-SEED-*`) link their items to real meals by name in
  `server/prisma/seed.js`, so reordering demo history works too. The "تواصل مع الدعم" button
  was **removed** from `OrderTrackingView` by product decision — there is no
  real support endpoint/number yet (contact stays as the marketing footer's
  `support@wajba.ps` until a support channel exists).
  **Post-delivery reviews (`feature/post-delivery-review`)**: the tracking page
  for a DELIVERED order shows a rating form (1–5 stars + optional comment, see
  `components/orders/OrderReviewCard.jsx`). Submitting posts
  `POST /api/reviews` (`reviewApi.createReview` — server enforces ownership,
  DELIVERED status, one review per order) and the page refetches, swapping the
  form for the read-only rating. `GET /api/orders/:id` now includes the order's
  `review` relation so the screen knows whether it was already rated;
  `orderToTracking` maps it as `review`. The owner reviews dashboard picks the
  new reviews up automatically via the existing public `GET /reviews/restaurant/:id`.
- [ ] ~~The account screen (`src/app/(customer)/account/`) is UI-only this phase~~ —
  DONE (`feature/api-integration`): the page is a Client Component gated on
  `AuthContext` status (redirects to `/login` when `unauthenticated`, shows a
  loading shell while restoring), fetches `GET /api/auth/profile` on mount so
  addresses/`createdAt` are always fresh (login/refresh payloads don't carry
  them), and renders `ProfileHeader` + `SavedAddressesList`. Saved addresses are
  now real: delete calls `DELETE /api/auth/profile/address/:id` and the
  "أضف عنوان جديد" button opens an inline form that posts via
  `POST /api/auth/profile/address` (`label`/`city`/`street` required,
  `building`/`details`/`isDefault` optional). `src/lib/mock/user.js` and
  `src/lib/mock/gazaAreas.js` were deleted. Profile edits (first/last name,
  phone) ARE live via `PUT /api/auth/profile` (`updateProfileSchema`: each field
  optional but at least one required, phone must match `^05\d{8}$`, phone unique
  except self) — `ProfileHeader` saves through `AuthContext.updateUser`, which
  refreshes the session user and the account page re-renders from the returned
  profile. "جعله الافتراضي" per existing address lives on the account screen
  (`updateAddress(id, { isDefault: true })`); the checkout picker
  (`SavedAddressPicker`) stays selection-only and links back to `/account`. The settings menu (`AccountMenuList`) was
  removed entirely by product decision — its "الإشعارات" and "الدعم والمساعدة"
  entries and a full "غيّر كلمة السر" flow are all deferred. Logout IS live:
  the `AppHeader` user dropdown calls `logout()` → `POST /api/auth/logout`
  (clears local tokens) and redirects to `/home`. "غيّر كلمة السر" was
  deliberately omitted — the
  `/reset-password` route doesn't exist yet and should be built with the auth
  phase before adding that link.
- [ ] ~~Active orders (قيد التحضير / بالطريق) temporarily made the whole
  `OrderHistoryCard` a Link to `/order-confirmation`~~ — DONE: active order cards
  now link to the dedicated per-order tracking page `/orders/[id]`
  (`feature/order-tracking-ui`), rendered by the shared
  `components/orders/OrderProgressSteps.jsx`.
- **Guest (logged-out) flow — browsing-first, like global delivery apps**: a
  guest browses restaurants/menus and builds the cart freely. The `AppHeader`
  never shows the old "زائر" placeholder — when nobody is signed in it renders
  a "تسجيل الدخول" CTA (plus "إنشاء حساب" on `sm+`) next to the live cart icon,
  instead of the avatar menu. On the **cart** page a guest gets a notice block
  ("إكمال الطلب متوقف هلق…") with login/signup buttons instead of the
  "أكمل الطلب" checkout link — checkout itself stays an auth-only route that
  redirects `/login` (the safety net for direct URL visits). The same gate is
  applied to `/orders`, `/orders/[id]`, and `/account` (account-only data):
  `status === "unauthenticated"` → `router.replace("/login?next=<current>")`,
  `"loading"` → loading shell (early returns kept AFTER all hooks so the React
  Rules of Hooks hold). The login/register
  forms accept `?next=` (e.g. `/login?next=/cart`) and return to that same-app
  path after success (open-redirect guarded); without `next` they go to `/home`.
  While `AuthContext` is restoring the session, the header shows a neutral
  avatar placeholder so signed-in users don't flash a login button. All pages
  pass `userName={user?.firstName}` (no `زائر` fallback) — see the header note
  in `components/customer/AppHeader.jsx`.
- **Role guard — this repo hosts BOTH the customer app and the owner
  dashboard**: `AuthContext` keeps ANY authenticated role (CUSTOMER/DRIVER/
  OWNER/ADMIN) in the session (`role` is exposed to callers). Route groups
  self-guard instead of the context rejecting sessions: the customer group's
  `CustomerGuard` lets any authenticated user browse the public storefront but
  redirects non-customers (`user.role !== "CUSTOMER"`) away from customer-only
  routes (cart/checkout/orders/account/order-confirmation) to their dashboard
  (DRIVER → `/driver`, ADMIN → `/admin`, otherwise → `/owner`); the
  owner dashboard shell (`components/owner/OwnerShell.jsx`) redirects
  unauthenticated users to `/login?next=/owner` and non-OWNER users to `/home`.
  `LoginForm` routes OWNER → `/owner`, DRIVER → `/driver`, and ADMIN → `/admin`
  after login; every other role follows
  `?next=` (default `/home`). The server's `authorize("OWNER")`/
  `authorize("CUSTOMER")`/`authorize("ADMIN")` remain the authorization backstop.
- **Owner dashboard (`/owner/*`) — DONE (`feature/owner-dashboard`)**: routes
  live under the `(dashboard)` route group → `src/app/(dashboard)/layout.js`
  (metadata + `<OwnerShell>`) and `src/app/(dashboard)/owner/{,orders,menu,
  reviews,settings}/page.js`. The group is a separate path namespace on
  purpose: `(owner)` collided with `(customer)`'s `/orders`, so the dashboard
  resolves to `/owner`, `/owner/orders`, `/owner/menu`, `/owner/reviews`,
  `/owner/settings`. `OwnerShell` (sidebar + topbar + mobile drawer, auth-gated)
  wraps the pages; `OwnerContext` owns the owner's restaurant (fetches
  `GET /restaurants/owner/my`, exposes `restaurant`, `restaurantLoading`,
  `restaurantError`, `reloadRestaurant`) and surfaces a setup form when no
  restaurant exists yet — the create flow itself lives in
  `RestaurantSetupForm` (`POST /restaurants` via `restaurantApi.createRestaurant`,
  then `reloadRestaurant`), and edits/status live in `RestaurantSettingsForm`
  (`restaurantApi.updateMyRestaurant` / `updateMyRestaurantStatus`). Screens: overview
  (`GET /dashboard` → `dashboardToView`: orders/revenue/reviews totals +
  orders-by-status + 5 recent orders), orders (`GET /orders/restaurant/my`,
  `PATCH /orders/:id/status` for the legal transitions, and a driver-assign
  **modal** — order.service.js requires status === "READY" before assigning, and
  `PATCH /orders/:id/assign` moves the order to ASSIGNED, so READY orders show a
  "تعيين سائق" button (via `GET /restaurants/owner/my/drivers`) and READY is
  intentionally excluded from `OWNER_STATUS_TRANSITIONS`), menu
  (`GET /categories/my` + `GET /meals/my`; category CRUD via
  `POST|PUT|DELETE /categories`; meal create/edit/delete via
  `POST|PUT|DELETE /meals`, `PATCH /meals/:id/feature`, and
  `PATCH /meals/:id/availability` with `{ status }` ∈
  AVAILABLE/OUT_OF_STOCK/HIDDEN), reviews (list from
  `GET /reviews/restaurant/:id` — note this endpoint returns the reviews as a
  bare array with `pagination` as a sibling the client interceptor drops, so the
  page lists up to 100 and takes totals from `GET /dashboard` instead), and
  settings (restaurant edit via `PUT /restaurants/owner/my` + open/closed via
  `PATCH /restaurants/owner/my/status`). Client modules: `src/lib/api/{dashboard,
  reviews}.js` are new; `restaurants`, `meals`, `categories`, `orders` gained
  the owner calls; presenters (`dashboardToView`, `orderToOwnerCard`,
  `reviewToOwnerCard`, `restaurantToOwnerForm`, `restaurantFormToPayload`,
  `ownerOrderStatusLabel`, `OWNER_STATUS_LABELS`) live in `src/lib/api/
  presenters.js`. Owner design uses the generic tokens (`surface`, `border`,
  `muted`, `primary`) and the same a11y checklist as the customer app (focus
  trap + Escape + `role="dialog"` modals, `aria-label`s, motion-reduce). Owner
  polish (`feature/owner-polish`): the topbar mirrors the customer `AppHeader`
  brand (BrandMark + وجبة wordmark, 72px, centered restaurant status) and no
  longer links to the storefront — the "عرض المتجر" button and "واجهة الزبون"
  menu item were removed by product decision while the customer app itself stays
  intact; every tab title starts with "وجبة"; dashboard numbers are Latin digits
  (see §5 exception); and the settings form locks `email` + `cuisine` as disabled
  inputs (`cuisine` was never in `updateRestaurantSchema`, email is fixed by
  decision). Dashboard blocks are no longer white: the generic tokens in
  `globals.css` are aliased to the customer palette — `surface` = cream-deep
  (`#f4ead5`), `foreground` = cocoa, `muted` = cocoa-soft, `border` = warm clay
  tan, `primary`/`primary-dark` = terra — so cards, sidebar, modals and empty
  states match the storefront's warm look (the topbar stays translucent cream);
  form inputs and secondary buttons keep a white fill (`bg-white` in
  `OwnerFields`) so they read as raised fields on the cream-deep blocks, exactly
  like the customer app. The "حدّث" refresh action is a single shared
  `components/owner/RefreshButton.jsx` (icon + label + spin-on-load) used
  everywhere it appears — overview, orders, reviews, and the menu manager — so
  its shape never drifts. Deferred:
  an owner earnings breakdown beyond totals and a dedicated owner login page
  (owners sign in via the shared `/login` today).
- **Real-time order updates — DONE (`feature/real-time-orders`)**: the server
  streams order events over SSE at `GET /api/orders/events` (registered BEFORE
  the `authenticate` middleware because EventSource can't set an Authorization
  header — the handler validates a `?token=` query param itself and is scoped to
  the caller's role: OWNER → `restaurant:<id>`, DRIVER → `driver:<id>`,
  CUSTOMER → `customer:<id>`, ADMIN → `admin`). Every mutation in
  `order.service.js` publishes a lightweight event (type `ORDER_CREATED` /
  `ORDER_UPDATED` / `DRIVER_ASSIGNED` / `ORDER_CANCELLED` + order ids + new
  status only — never the full payload) through the in-memory
  `server/src/utils/eventBus.js`; clients refetch through the normal
  authenticated endpoints, they never trust SSE payloads. The bus is in-memory
  by design for a single server process — swap for Redis pub/sub if the server
  ever scales horizontally. The client subscribes via the shared
  `src/hooks/useOrderEvents.js` hook (`@hooks` alias, added to `jsconfig.json`),
  which reconnects after errors with the current localStorage token (survives
  background access-token refreshes). Wired into: owner orders
  (`/owner/orders`), driver list (`/driver` — reload is `{ silent: true }` so
  the list never flashes a skeleton), customer tracking
  (`/orders/[id]` — only refetches when the event names that order), and the
  customer orders history (`/orders` — silent refresh). The manual
  `RefreshButton` stays as the always-available fallback.
- **Driver dashboard (`/driver/*`) — DONE (`feature/driver-dashboard`)**: routes
  live under the `(driver)` route group → `src/app/(driver)/layout.js` (metadata
  + `<DriverShell>`) and `src/app/(driver)/driver/{,orders/[id]}/page.js`. The
  shell (`components/driver/DriverShell.jsx`) is a slim mobile-first header
  (BrandMark + وجبة wordmark, account menu, logout) that redirects
  unauthenticated users to `/login?next=/driver` and non-DRIVER roles to `/home`.
  The list screen fetches `GET /orders/driver/my` and maps each order through
  `orderToDriverCard` (presenters.js), split into "جارية" (ASSIGNED/PICKED_UP/
  ON_THE_WAY) and "مكتملة" (DELIVERED) tabs with a shared `RefreshButton`; the
  detail screen fetches `GET /orders/:id` (already DRIVER-aware server-side),
  shows the customer + address + a `tel:` call button + itemized totals, and a
  single primary action button that advances the delivery via
  `PATCH /orders/:id/driver-status` using the transition map
  `ASSIGNED→PICKED_UP→ON_THE_WAY→DELIVERED` (server rejects illegal transitions
  and orders not assigned to the caller with 403 "Access denied."). Status
  rendering reuses the customer-app `OrderStatusBadge` via the Arabic
  `statusLabel`. `LoginForm` routes a DRIVER session to `/driver` after login,
  and `CustomerGuard` sends authenticated non-customers to their dashboard
  (DRIVER → `/driver`, otherwise → `/owner`). Driver numbers are Latin digits
  like the owner dashboard (§5 exception). The owner ↔ driver loop is complete:
  the owner assigns a driver on READY orders (per-restaurant driver list), and
  the driver sees and advances only their own assigned deliveries.
- **Admin dashboard (`/admin/*`) — DONE (`feature/admin-dashboard`)**: routes
  live under the `(admin)` route group → `src/app/(admin)/layout.js` (metadata
  + `<AdminShell>`) and `src/app/(admin)/admin/{,users,users/[id],
  restaurants,restaurants/[id]}/page.js` (overview / users list / user detail /
  restaurants list / restaurant detail). `AdminShell` (sidebar + topbar + mobile
  drawer, auth-gated) wraps the pages and is built from the owner-shell pattern;
  it redirects unauthenticated users to `/login?next=/admin` and non-ADMIN roles
  to `/home`. Screens: overview (`GET /users` + `GET /restaurants` at
  `?limit=100` → stat cards + recent users/restaurants), users list (role filter
  tabs CUSTOMER/OWNER/DRIVER/ADMIN + per-row status picker), user detail (account
  info + saved addresses + status), restaurants list (OPEN/CLOSED/SUSPENDED
  filter tabs + per-row status picker), restaurant detail (counts for
  meals/categories/orders/reviews + owner card with link to the owner's account
  + contact info). Destructive transitions are confirm-gated via
  `ConfirmStatusModal`: blocking a user (`BLOCKED`) or suspending a restaurant
  (`SUSPENDED`) require confirmation, while ACTIVE/INACTIVE and OPEN/CLOSED apply
  immediately via `AdminStatusSelect` — all mutations call
  `PATCH /users/:id/status` / `PATCH /restaurants/:id/status` through the new
  `src/lib/api/admin.js` module (`getUsers/getUserById/updateUserStatus/
  getRestaurants/getRestaurantById/updateRestaurantStatus`, exposed on the shared
  client as `adminApi`). Admin presenters live in `presenters.js` under the ADMIN
  section (`adminUserToCard/adminUserToDetail/adminRestaurantToCard/
  adminRestaurantToDetail`, reusing `RESTAURANT_STATUS_LABELS`). Because the API
  client's interceptor drops the response envelope's sidecar `pagination`, the
  admin lists fetch up to 100 rows and filter/paginate client-side (same pattern
  as the owner reviews screen). Admin login uses the shared `/login` form
  (seeded `admin@wajba.com`/`Admin$$1234`); admin numbers are Latin digits like
  the owner/driver dashboards (§5 exception).
- As new features ship (auth, cart, checkout, dashboard), add their own
  placeholder/TODO items here rather than leaving them undocumented in code only.

## 12. Do / Don't — Project-Wide Quick Reference

**Do:**
- Reuse existing design tokens, spacing scale, and radii on every route.
- Match the established Palestinian-dialect tone in all new user-facing copy,
  everywhere in the product.
- Extend accessibility and responsive checklists to every new page without
  exception.
- Update this file when a real architectural decision is made.

**Don't:**
- Don't add a `tailwind.config.js` — this project uses Tailwind v4's `@theme inline`.
- Don't introduce a second icon library, animation library, carousel package,
  toast library, or CSS-in-JS solution anywhere in the repo.
- Don't hardcode LTR text direction outside of numerals/emails/phone numbers.
- Don't invent a data-fetching or state-management pattern for a new feature
  without checking whether one is already documented here — and if not, add it
  here once decided so the next agent doesn't reinvent it again.
