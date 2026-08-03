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
- No backend/database is defined yet. When one is added (API routes, external
  API, ORM), this file must be updated with the chosen pattern before agents
  start writing data-fetching code — don't invent a data layer ad hoc.

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
- [ ] Checkout + order-confirmation are UI-only this phase: Cash-on-Delivery is
  the only active payment (بطاقة ائتمان is a disabled teaser card with a
  "قريبًا" badge — no e-payment logic/form yet), the delivery fee is a flat
  mock ٥ ₪, order numbers are fake (`WB-` + last 6 digits of `Date.now()`), and
  the last placed order persists under the `wajba-last-order` localStorage key
  (deliberately separate from `wajba-cart`). No real API or payment gateway —
  replace with the real data layer before production (AGENTS.md §2/§10).
- [ ] The orders history screen (`src/app/(customer)/orders/`) is UI-only this
  phase: data is mock (`src/lib/mock/orders.js` — 6 orders with static dates
  anchored to the authoring day so the statically prerendered route stays
  hydration-safe, no real API). The "اطلب نفس الطلبية" button only
  `console.log`s the order id — later it should auto-fill `CartContext` with the
  previous order's items and navigate to that restaurant's page (TODO comment in
  `src/components/orders/OrderHistoryCard.jsx`). Active orders (قيد التحضير /
  بالطريق) temporarily make the whole card a Link to `/order-confirmation` —
  replace with a dedicated per-order tracking page (`/orders/[id]`,
  feature/order-tracking-ui) before production.
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
