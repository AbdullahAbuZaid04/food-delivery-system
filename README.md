# Wajba

> A full-stack food delivery platform for Gaza restaurants.

**Tech Stack:** Next.js 16 (App Router) · Express 5 · Prisma · PostgreSQL · Tailwind CSS v4

---

## Features

| Role                 | Capabilities                                                                  |
| -------------------- | ----------------------------------------------------------------------------- |
| **Customer**         | Browse restaurants, order food, track delivery in real-time, rate restaurants |
| **Restaurant Owner** | Manage menu/categories, accept/reject orders, assign drivers, view dashboard  |
| **Driver**           | View assigned deliveries, update delivery status step-by-step                 |
| **Admin**            | Manage users, approve restaurants/drivers, view platform overview             |

* **Real-time:** Server-Sent Events (SSE) for live order updates across all roles
* **RTL-first:** Arabic (Palestinian dialect) with Arabic-Indic numerals
* **Responsive:** Mobile-first design, works on all screen sizes
* **Accessible:** Focus trap, keyboard navigation, ARIA labels

---

## Getting Started

### Prerequisites

* Node.js 18+
* PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/abdullahmabuzaid/wajba.git
cd wajba

# Server
cd server && npm install

# Client (new terminal)
cd client && npm install
```

### 2. Database Setup

```bash
cd server
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 3. Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable             | Description                                 | Example                                                                    |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                | `postgresql://postgres:password@localhost:5432/wajba`                      |
| `JWT_SECRET`         | Access token secret (512-bit)               | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Refresh token secret (different from above) | Same command                                                               |
| `CORS_ORIGINS`       | Comma-separated allowed origins             | `http://localhost:3000`                                                    |

Client requires only:

```bash
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run

```bash
# Server (port 5000)
cd server && npm run dev

# Client (port 3000)
cd client && npm run dev
```

---

## Demo Accounts

> **Demo accounts only — do not use in production.**

### Platform Users

| Role              | Email                | Password         | Notes                |
| ----------------- | -------------------- | ---------------- | -------------------- |
| Admin             | `admin@wajba.com`    | `Admin$$1234`    | Full platform access |
| Customer          | `customer@wajba.com` | `Customer$$1234` | Demo customer        |
| Driver (Approved) | `driver@wajba.com`   | `Driver$$1234`   | Approved driver      |
| Driver (Pending)  | `driver2@wajba.com`  | `Driver$$1234`   | Pending approval     |

### Restaurant Owners

| Restaurant | Email               | Password      | Cuisine                 |
| ---------- | ------------------- | ------------- | ----------------------- |
| Baladna    | `baladna@wajba.com` | `Owner$$1234` | Traditional Palestinian |
| Al-Buhhar  | `buhhar@wajba.com`  | `Owner$$1234` | Seafood                 |
| Al-Taj     | `taj@wajba.com`     | `Owner$$1234` | Pizza & Sandwiches      |
| Abu Saud   | `abusaad@wajba.com` | `Owner$$1234` | Eastern Desserts        |
| Al-Azeel   | `azli@wajba.com`    | `Owner$$1234` | Grilled Meat            |
| Roseeta    | `roseeta@wajba.com` | `Owner$$1234` | Pizza & Sandwiches      |
| Al-Ramal   | `ramal@wajba.com`   | `Owner$$1234` | Falafel                 |
| Sea Juices | `juices@wajba.com`  | `Owner$$1234` | Fresh Juices            |

---

## Project Structure

```text
client/                          # Next.js 16 (App Router)
  src/
    app/                         # Routes
      (customer)/                # Customer routes
      (dashboard)/               # Owner dashboard routes
      (driver)/                  # Driver dashboard routes
      (admin)/                   # Admin dashboard routes
      (auth)/                    # Login, register, forgot password
    components/                  # Reusable components
      customer/                  # Customer-specific
      owner/                     # Owner-specific
      driver/                    # Driver-specific
      admin/                     # Admin-specific
      auth/                      # Auth forms
      orders/                    # Shared order components
    context/                     # React Context (Auth, Cart)
    hooks/                       # Custom hooks
    lib/
      api/                       # API client + per-domain modules
      constants.js               # Shared patterns, helpers, labels
      presenters.js              # Data transformers

server/                          # Express 5 API
  src/
    modules/                     # Feature modules
      auth/                      # Register, login, refresh, profile
      restaurants/               # Restaurant CRUD, public listing
      meals/                     # Meal CRUD, availability
      categories/                # Category CRUD
      orders/                    # Order creation, status, SSE events
      reviews/                   # Review creation, listing
      dashboard/                 # Owner dashboard stats
      users/                     # Admin user management
      admin/                     # Admin restaurant/driver management
    middlewares/                 # Auth, validation, rate limiting, error handling
    utils/                       # JWT, pagination, event bus, token blacklist
  prisma/                        # Schema, migrations, seed
```

---

## Architecture

| Component         | Technology                   | Notes                                        |
| ----------------- | ---------------------------- | -------------------------------------------- |
| **Auth**          | JWT (access + refresh)       | Automatic refresh, token rotation, blacklist |
| **Real-time**     | SSE                          | Role-based scoping, in-memory event bus      |
| **Cart**          | React Context + localStorage | One restaurant per cart                      |
| **Validation**    | Zod                          | Both client presenters and server routes     |
| **Rate Limiting** | In-memory                    | Global (100 req/15min) + auth-specific       |
| **Pagination**    | Server-side                  | Max 50 items per page                        |
| **Database**      | PostgreSQL + Prisma          | Type-safe queries, migrations                |

---

## API Endpoints

### Auth

| Method | Endpoint             | Description                      | Auth |
| ------ | -------------------- | -------------------------------- | ---- |
| POST   | `/api/auth/register` | Create account                   | No   |
| POST   | `/api/auth/login`    | Login                            | No   |
| POST   | `/api/auth/refresh`  | Refresh access token             | No   |
| POST   | `/api/auth/logout`   | Logout (blacklist refresh token) | Yes  |
| GET    | `/api/auth/profile`  | Get current user profile         | Yes  |
| PUT    | `/api/auth/profile`  | Update profile                   | Yes  |

### Restaurants

| Method | Endpoint                           | Description                     | Auth  |
| ------ | ---------------------------------- | ------------------------------- | ----- |
| GET    | `/api/restaurants`                 | List restaurants (public)       | No    |
| GET    | `/api/restaurants/:slug`           | Get restaurant by slug (public) | No    |
| POST   | `/api/restaurants`                 | Create restaurant               | OWNER |
| PUT    | `/api/restaurants/owner/my`        | Update own restaurant           | OWNER |
| PATCH  | `/api/restaurants/owner/my/status` | Toggle open/closed              | OWNER |

### Meals

| Method | Endpoint                              | Description         | Auth  |
| ------ | ------------------------------------- | ------------------- | ----- |
| GET    | `/api/meals/restaurant/:restaurantId` | List meals (public) | No    |
| POST   | `/api/meals`                          | Create meal         | OWNER |
| PUT    | `/api/meals/:id`                      | Update meal         | OWNER |
| DELETE | `/api/meals/:id`                      | Delete meal         | OWNER |
| PATCH  | `/api/meals/:id/availability`         | Toggle availability | OWNER |

### Orders

| Method | Endpoint                        | Description            | Auth     |
| ------ | ------------------------------- | ---------------------- | -------- |
| POST   | `/api/orders`                   | Create order           | CUSTOMER |
| GET    | `/api/orders/my`                | List own orders        | CUSTOMER |
| GET    | `/api/orders/:id`               | Get order details      | Yes      |
| PATCH  | `/api/orders/:id/status`        | Update status          | OWNER    |
| PATCH  | `/api/orders/:id/cancel`        | Cancel order           | CUSTOMER |
| PATCH  | `/api/orders/:id/assign`        | Assign driver          | OWNER    |
| PATCH  | `/api/orders/:id/driver-status` | Update delivery status | DRIVER   |
| GET    | `/api/orders/events`            | SSE stream (all roles) | Yes      |

### Reviews

| Method | Endpoint                      | Description           | Auth     |
| ------ | ----------------------------- | --------------------- | -------- |
| POST   | `/api/reviews`                | Create review         | CUSTOMER |
| GET    | `/api/reviews/restaurant/:id` | List reviews (public) | No       |

### Admin

| Method | Endpoint                      | Description              | Auth  |
| ------ | ----------------------------- | ------------------------ | ----- |
| GET    | `/api/users`                  | List users               | ADMIN |
| PATCH  | `/api/users/:id/status`       | Update user status       | ADMIN |
| PATCH  | `/api/restaurants/:id/status` | Update restaurant status | ADMIN |

---

## Order Status Flow

```text
Customer Creates
      ↓
   PENDING
      ↓
   ACCEPTED
      ↓
  PREPARING
      ↓
    READY
      ↓
  ASSIGNED
      ↓
  PICKED_UP
      ↓
 ON_THE_WAY
      ↓
  DELIVERED

CANCELLED
```

---

## License

ISC
