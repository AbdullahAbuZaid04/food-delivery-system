# مرجع واجهة الباك إند — نظام توصيل الطعام (Food Delivery System)

> **المصدر:** فحص كامل وحرفي لملفات `server/src` + `server/prisma/schema.prisma` + `server/prisma/seed.js` + `server/.env`
> **التاريخ:** 2026-08-03
> **التقنية:** Node.js (CommonJS) + Express 5 + Prisma 7 (PostgreSQL) + Zod 4 + JWT (jsonwebtoken 9)
> **بدء التشغيل:** `npm run dev` → `server.js` يقرأ `PORT` من البيئة (الافتراضي 5000)
> **القاعدة الأساسية للروابط:** جميع المسارات تُركّب تحت البادئة `/api` — مثال: `POST http://localhost:5000/api/auth/login`

---

## شكل الاستجابة العام (Global Response Convention)

كل الاستجابات الناجحة تأتي على شكل:

```json
{ "success": true, "message": "...", "data": { ... } }
```

مع ملاحظات:

- بعض النهايات الناجحة لا ترسل `message` (مثل `getProfile` و `getMyRestaurant` و `getAllRestaurants`) — ترسل `success` و `data` فقط.
- بعض النهايات الناجحة لا ترسل `data` (مثل logout، delete، clearCart) — ترسل `success` و `message` فقط.

شكل الخطأ القياسي:

```json
{ "success": false, "message": "نص الخطأ" }
```

شكل خطأ التحقق من الصحة (Zod validation) — خاص بـ `validate` middleware فقط:

```json
{ "success": false, "errors": [{ "field": "email", "message": "..." }] }
```

(status 400)

خطأ Rate Limiting:

```json
{ "success": false, "message": "Too many requests. Please try again later." }
```

(status 429)

> **ملاحظة:** كل قيم `Decimal` في قاعدة البيانات (أسعار، deliveryFee، إلخ) تظهر في JSON كنصوص (`"12.50"` وليس `12.5`)، لأن Prisma يهرسلها كـ string.

---

## 1. قائمة الـ Endpoints الكاملة

### 1.1 مجموعة Auth (المصادقة والملف الشخصي)

#### `POST /api/auth/register` — تسجيل مستخدم جديد

- **الحماية:** عام (Public)
- **Rate limited:** نعم — 10 طلبات لكل 15 دقيقة لكل IP (مؤقت في الذاكرة)
- **Request body (مطلوب من Zod schema):**

```json
{
  "firstName": "string (trim, 2-50 chars, مطلوب)",
  "lastName": "string (trim, 2-50 chars, مطلوب)",
  "email": "email valid, يتم تحويله لـ lowercase (مطلوب)",
  "phone": "string يطابق /^05\\d{8}$/ — رقم فلسطيني (مطلوب)",
  "password": "string ≥ 8 أحرف (مطلوب)",
  "role": "enum: CUSTOMER | OWNER | DRIVER — اختياري، الافتراضي CUSTOMER"
}
```

> `ADMIN` غير مسموح بالتسجيل عبر هذا الـ endpoint (غير موجود في الـ enum).

- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "cuid string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "CUSTOMER"
    },
    "token": "JWT access token (string)",
    "refreshToken": "JWT refresh token (string)"
  }
}
```

- **أخطاء:**
  - `400` — `{ "success": false, "message": "Email already exists." }`
  - `400` — `{ "success": false, "message": "Phone number already exists." }`
  - `400` — `{ "success": false, "message": "Role not found." }` (دور غير موجود في جدول Role)
  - `400` — validation errors shape (حقول zod)
  - `429` — rate limit shape

#### `POST /api/auth/login` — تسجيل الدخول

- **الحماية:** عام
- **Rate limited:** نعم — 10 طلبات لكل 15 دقيقة لكل IP
- **Request body:**

```json
{
  "email": "email valid, lowercase (مطلوب)",
  "password": "string ≥ 8 أحرف (مطلوب)"
}
```

- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "cuid string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "CUSTOMER"
    },
    "token": "JWT access token (string)",
    "refreshToken": "JWT refresh token (string)"
  }
}
```

- **أخطاء:**
  - `401` — `{ "success": false, "message": "Invalid email or password." }` (سواء كان الإيميل غير موجود أو كلمة السر خاطئة)
  - `400` — validation errors shape
  - `429` — rate limit shape
- **ملاحظة:** الـ login لا يتحقق من حالة المستخدم (`status`) — مستخدم BLOCKED أو INACTIVE يستطيع تسجيل الدخول والحصول على توكن، لكنه سيُحجب في الطلبات التالية عبر الـ middleware.

#### `GET /api/auth/profile` — بيانات المستخدم الحالي (Get Current User)

- **الحماية:** محمي — `authenticate` (أي دور: CUSTOMER / OWNER / DRIVER / ADMIN)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "profileImage": "string | null",
      "status": "ACTIVE | INACTIVE | BLOCKED",
      "isVerified": "boolean",
      "role": "CUSTOMER | OWNER | DRIVER | ADMIN",
      "addresses": [
        {
          "id": "cuid string",
          "userId": "cuid string",
          "label": "string",
          "city": "string",
          "street": "string",
          "building": "string | null",
          "details": "string | null",
          "latitude": "string (Decimal) | null",
          "longitude": "string (Decimal) | null",
          "isDefault": "boolean",
          "createdAt": "ISO datetime",
          "updatedAt": "ISO datetime"
        }
      ],
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime"
    }
  }
}
```

- **أخطاء:**
  - `401` — middleware errors (لا توكن / توكن منتهي / غير صالح / مستخدم غير موجود)
  - `403` — `{ "success": false, "message": "Account is not active." }`
  - `404` — `{ "success": false, "message": "User not found." }`

#### `POST /api/auth/logout` — تسجيل الخروج

- **الحماية:** محمي — `authenticate`
- **Request body:** لا يوجد
- **Response ناجح — `200 OK`:**

```json
{ "success": true, "message": "Logged out successfully." }
```

- **ملاحظة مهمة:** الـ logout **لا يفعل شيئًا فعليًا** — لا يوجد blacklist للتوكن ولا أي إبطال من جهة الخادم. الخادم يرد بالنجاح فقط، وعلى الفرونت إند حذف التوكن محليًا.

#### `POST /api/auth/profile/address` — إضافة عنوان جديد

- **الحماية:** محمي — `authenticate`
- **Request body:**

```json
{
  "label": "string trim min 1 (مطلوب)",
  "city": "string trim min 1 (مطلوب)",
  "street": "string trim min 1 (مطلوب)",
  "building": "string trim (اختياري)",
  "details": "string trim (اختياري)",
  "latitude": "number بين -90 و 90 (اختياري)",
  "longitude": "number بين -180 و 180 (اختياري)",
  "isDefault": "boolean (اختياري)"
}
```

- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "Address added successfully.",
  "data": {
    "id": "cuid string",
    "userId": "cuid string",
    "label": "string",
    "city": "string",
    "street": "string",
    "building": "string | null",
    "details": "string | null",
    "latitude": "string | null",
    "longitude": "string | null",
    "isDefault": "boolean",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime"
  }
}
```

- **أخطاء:** `400` (validation أو خطأ أعمال) — `401`/`403` من الـ middleware

#### `PUT /api/auth/profile/address/:id` — تعديل عنوان

- **الحماية:** محمي — `authenticate`
- **Request body:** نفس حقول addAddress لكن **كلها اختيارية** (نفس `updateAddressSchema` — كل حقل `.optional()`)
- **Response ناجح — `200 OK`:** `{ success: true, message: "Address updated successfully.", data: { ...نفس شكل Address أعلاه... } }`
- **أخطاء:**
  - `403` — `{ "success": false, "message": "Access denied." }` (العنوان ليس للمستخدم)
  - `404` — `{ "success": false, "message": "Address not found." }`
  - `400` — validation أو خطأ أعمال

#### `DELETE /api/auth/profile/address/:id` — حذف عنوان

- **الحماية:** محمي — `authenticate`
- **Request body:** لا يوجد
- **Response ناجح — `200 OK`:**

```json
{ "success": true, "message": "Address deleted successfully." }
```

- **أخطاء:** `403` (Access denied) — `404` (Address not found) — `400`

---

### 1.2 مجموعة Restaurants (المطاعم)

#### `POST /api/restaurants` — إنشاء مطعم

- **الحماية:** محمي + `authorize("OWNER")` فقط
- **القيود:** يمكن لكل OWNER إنشاء مطعم واحد فقط (unique على ownerId) — إن وجد يعيد خطأ
- **Request body:**

```json
{
  "name": "string trim 2-100 chars (مطلوب)",
  "description": "string trim max 500 (اختياري)",
  "phone": "string يطابق /^05\\d{8}$/ (مطلوب)",
  "email": "email lowercase (اختياري)",
  "logoUrl": "url صالح (اختياري)",
  "coverImageUrl": "url صالح (اختياري)",
  "deliveryFee": "number ≥ 0 — اختياري، الافتراضي 0",
  "minimumOrder": "number ≥ 0 — اختياري، الافتراضي 0",
  "estimatedDeliveryTime": "integer ≥ 1 دقيقة (اختياري)",
  "address": {
    "label": "string (مطلوب)",
    "city": "string (مطلوب)",
    "street": "string (مطلوب)",
    "building": "string (اختياري)",
    "details": "string (اختياري)",
    "latitude": "number -90..90 (اختياري)",
    "longitude": "number -180..180 (اختياري)"
  }
}
```

- **ملاحظة:** الـ `slug` يُنشأ تلقائيًا من `name` (lowercase + واصلات) وإذا كان مكررًا يُضاف له طابع زمني.
- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "Restaurant created successfully.",
  "data": {
    "id": "cuid string",
    "ownerId": "cuid string",
    "addressId": "cuid string",
    "name": "string",
    "slug": "string",
    "description": "string | null",
    "phone": "string",
    "email": "string | null",
    "logoUrl": "string | null",
    "coverImageUrl": "string | null",
    "deliveryFee": "string (Decimal)",
    "minimumOrder": "string (Decimal)",
    "estimatedDeliveryTime": "integer | null",
    "status": "OPEN",
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime",
    "deletedAt": null,
    "owner": {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "email": "..."
    },
    "address": {
      "id": "...",
      "userId": "...",
      "label": "...",
      "city": "...",
      "street": "...",
      "building": "...",
      "details": "...",
      "latitude": "...",
      "longitude": "...",
      "isDefault": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

- **أخطاء:**
  - `400` — `{ "success": false, "message": "You already have a restaurant." }`
  - `400` — validation / خطأ أعمال
  - `401`/`403` — من الـ middleware

#### `GET /api/restaurants/owner/my` — مطعمي (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "...", "ownerId": "...", "addressId": "...", "name": "...", "slug": "...",
    "description": "...", "phone": "...", "email": "...", "logoUrl": "...",
    "coverImageUrl": "...", "deliveryFee": "...", "minimumOrder": "...",
    "estimatedDeliveryTime": "...", "status": "OPEN", "createdAt": "...",
    "updatedAt": "...", "deletedAt": null,
    "owner": { "id": "...", "firstName": "...", "lastName": "...", "email": "..." },
    "address": { "...كل حقول Address..." },
    "_count": { "categories": "number", "meals": "number" }
  }
}
```

- **أخطاء:** `404` — `{ "success": false, "message": "Restaurant not found." }` — `400` — `401`/`403`

#### `PUT /api/restaurants/owner/my` — تعديل مطعمي

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:** كل حقول createRestaurantSchema **اختيارية** (عدا `address` كائن اختياري). تغيير `name` يولّد slug جديد تلقائيًا.
- **Response ناجح — `200 OK`:** `{ success: true, message: "Restaurant updated successfully.", data: { ...Restaurant كامل مع owner و address... } }`
- **أخطاء:** `404` (Restaurant not found) — `400` (validation/أعمال) — `401`/`403`

#### `PATCH /api/restaurants/owner/my/status` — تغيير حالة المطعم

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:**

```json
{ "status": "OPEN | CLOSED | SUSPENDED" }
```

- **Response ناجح — `200 OK`:** `{ success: true, message: "Restaurant status updated successfully.", data: { ...Restaurant مع owner فقط (بدون address)... } }`
- **أخطاء:** `400` (validation — أو "Restaurant not found.") — `401`/`403`

#### `GET /api/restaurants` — قائمة المطاعم (عام)

- **الحماية:** عام (Public)
- **Query params (كلها اختيارية):** `page` (افتراضي 1)، `limit` (افتراضي 10)، `search` (بحث case-insensitive في الاسم)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": "...",
        "ownerId": "...",
        "addressId": "...",
        "name": "...",
        "slug": "...",
        "description": "...",
        "phone": "...",
        "email": "...",
        "logoUrl": "...",
        "coverImageUrl": "...",
        "deliveryFee": "...",
        "minimumOrder": "...",
        "estimatedDeliveryTime": "...",
        "status": "OPEN",
        "createdAt": "...",
        "updatedAt": "...",
        "deletedAt": null,
        "address": { "city": "string", "street": "string" },
        "_count": { "meals": "number", "reviews": "number" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

- **ملاحظات:** يعيد فقط المطاعم ذات `status: "OPEN"` وغير المحذوفة. مرتّبة بـ `createdAt desc`.
- **أخطاء:** `400` فقط.

#### `GET /api/restaurants/:slug` — تفاصيل مطعم بالـ slug (عام)

- **الحماية:** عام (Public)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "...", "ownerId": "...", "addressId": "...", "name": "...", "slug": "...",
    "description": "...", "phone": "...", "email": "...", "logoUrl": "...",
    "coverImageUrl": "...", "deliveryFee": "...", "minimumOrder": "...",
    "estimatedDeliveryTime": "...", "status": "OPEN", "createdAt": "...",
    "updatedAt": "...", "deletedAt": null,
    "owner": { "id": "...", "firstName": "...", "lastName": "...", "email": "..." },
    "address": { "...كل حقول Address..." },
    "_count": { "categories": "number", "meals": "number", "reviews": "number" }
  }
}
```

- **أخطاء:** `404` — `{ "success": false, "message": "Restaurant not found." }` — `400`
- **ملاحظة مهمة:** هذا الـ endpoint **لا يجلب قائمة المنيو** — لإحضار المنيو يجب استدعاء:
  - `GET /api/categories/restaurant/:restaurantId`
  - `GET /api/meals/restaurant/:restaurantId`
    لا يوجد endpoint واحد يجمع تفاصيل المطعم + المنيو معًا.

---

### 1.3 مجموعة Categories (التصنيفات)

#### `POST /api/categories` — إنشاء تصنيف

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:**

```json
{
  "name": "string trim 1-50 chars (مطلوب)",
  "imageUrl": "url صالح (اختياري)"
}
```

- **Response ناجح — `201 Created`:** `{ success: true, message: "Category created successfully.", data: { id, restaurantId, name, imageUrl, createdAt, updatedAt, deletedAt, _count: { meals } } }`
- **أخطاء:** `400` (يُرجَع "Restaurant not found." إذا لم يكن للمالك مطعم) — `401`/`403`

#### `GET /api/categories/my` — تصنيفات مطعمي (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Response ناجح — `200 OK`:** `{ success: true, data: [ { category + _count.meals }, ... ] }` مرتبة بـ `createdAt desc`

#### `GET /api/categories/restaurant/:restaurantId` — تصنيفات مطعم (عام)

- **الحماية:** عام
- **Response ناجح — `200 OK`:** `{ success: true, data: [ { category + _count.meals }, ... ] }`

#### `PUT /api/categories/:id` — تعديل تصنيف

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:** `{ "name": "string 1-50 (اختياري)", "imageUrl": "url (اختياري)" }`
- **Response ناجح — `200 OK`:** `{ success: true, message: "Category updated successfully.", data: { category + _count } }`
- **أخطاء:** `403` (Access denied) — `404` (Category not found) — `400`/`401`

#### `DELETE /api/categories/:id` — حذف تصنيف (soft delete)

- **الحماية:** محمي + `authorize("OWNER")`
- **Response ناجح — `200 OK`:** `{ success: true, message: "Category deleted successfully." }`
- **أخطاء:** `403` (Access denied) — `404` (Category not found) — `400` — `400` رسالة "Cannot delete category with meals. Remove meals first." إذا كانت تحتوي وجبات.

---

### 1.4 مجموعة Meals (الوجبات)

#### `GET /api/meals/search` — بحث عام عن وجبات

- **الحماية:** عام
- **Query params:** `q` (مطلوب — نص البحث)، `restaurantId` (اختياري)، `page` (افتراضي 1)، `limit` (افتراضي 10)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "restaurantId": "...",
      "categoryId": "...",
      "name": "...",
      "description": "...",
      "imageUrl": "...",
      "price": "string (Decimal)",
      "preparationTime": "integer | null",
      "isFeatured": "boolean",
      "status": "AVAILABLE | OUT_OF_STOCK | HIDDEN",
      "createdAt": "...",
      "updatedAt": "...",
      "deletedAt": null,
      "category": { "id": "...", "name": "..." },
      "restaurant": { "id": "...", "name": "...", "slug": "..." }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": "number",
    "totalPages": "number"
  }
}
```

- **أخطاء:** `400` — `{ "success": false, "message": "Search query is required." }` إذا كان `q` فارغًا.

#### `POST /api/meals` — إنشاء وجبة

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:**

```json
{
  "categoryId": "string (مطلوب — يجب أن تكون تصنيفًا يخص المطعم)",
  "name": "string trim 1-100 (مطلوب)",
  "description": "string trim max 500 (اختياري)",
  "imageUrl": "url (اختياري)",
  "price": "number > 0 (مطلوب)",
  "preparationTime": "integer ≥ 1 (اختياري)",
  "isFeatured": "boolean — اختياري، الافتراضي false"
}
```

- **ملاحظة:** لا يوجد حقل `status` في الـ schema — حالة الوجبة دائمًا `AVAILABLE` (لا يمكن تغييرها عبر أي endpoint).
- **Response ناجح — `201 Created`:** `{ success: true, message: "Meal created successfully.", data: { ...meal مع category: { id, name }... } }`
- **أخطاء:** `400` — "Restaurant not found." / "Category not found." / "Access denied." / validation — `401`/`403`

#### `GET /api/meals/my` — وجبات مطعمي (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Query params:** `categoryId` (اختياري — فلترة)
- **Response ناجح — `200 OK`:** `{ success: true, data: [ ...meal مع category... ] }`
- **ملاحظة:** يُعيد كل الوجبات بما فيها غير المتوفرة (لا فلترة على status).

#### `GET /api/meals/restaurant/:restaurantId` — وجبات مطعم (عام)

- **الحماية:** عام
- **Query params:** `categoryId` (اختياري — فلترة)
- **Response ناجح — `200 OK`:** `{ success: true, data: [ ...meal مع category... ] }`
- **ملاحظة:** **لا يفلتر حسب status** — تظهر وجبات OUT_OF_STOCK و HIDDEN للعميل.

#### `PUT /api/meals/:id` — تعديل وجبة

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:** كل حقول createMealSchema اختيارية
- **Response ناجح — `200 OK`:** `{ success: true, message: "Meal updated successfully.", data: { ...meal... } }`
- **أخطاء:** `400` ("Meal not found." / "Access denied." / validation) — `401`/`403`

#### `DELETE /api/meals/:id` — حذف وجبة (soft delete)

- **الحماية:** محمي + `authorize("OWNER")`
- **Response ناجح — `200 OK`:** `{ success: true, message: "Meal deleted successfully." }`
- **أخطاء:** `400` ("Meal not found." / "Access denied.") — `401`/`403`

#### `PATCH /api/meals/:id/feature` — تبديل خاصية "مميزة" (isFeatured)

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:** لا يوجد (يقلب القيمة الحالية)
- **Response ناجح — `200 OK`:** `{ success: true, message: "Meal featured status toggled.", data: { ...meal... } }`
- **أخطاء:** `400` — `401`/`403`

---

### 1.5 مجموعة Cart (السلة)

> كل الـ cart endpoints تتطلب `authenticate` فقط (لا تقييد بالدور في الراوتر).

#### `POST /api/cart/items` — إضافة وجبة للسلة

- **الحماية:** محمي (أي دور)
- **Request body:**

```json
{
  "mealId": "string (مطلوب)",
  "quantity": "integer ≥ 1 — اختياري، الافتراضي 1",
  "notes": "string trim max 200 (اختياري)"
}
```

- **المنطق:** يتحقق أن الوجبة موجودة و `status === "AVAILABLE"`. يمنع إضافة وجبات من مطاعم مختلفة (يعيد خطأ "Cannot add meals from different restaurants. Clear your cart first."). إذا كانت الوجبة موجودة بالفعل يزيد الكمية.
- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "Item added to cart.",
  "data": {
    "id": "cuid string",
    "cartId": "cuid string",
    "mealId": "cuid string",
    "quantity": "integer",
    "notes": "string | null",
    "meal": {
      "id": "...",
      "name": "...",
      "price": "string",
      "imageUrl": "...",
      "restaurantId": "..."
    }
  }
}
```

- **أخطاء:** `400` — "Meal not found." / "Meal is not available." / "Cannot add meals from different restaurants. Clear your cart first." / validation — `401`

#### `GET /api/cart` — محتوى السلة

- **الحماية:** محمي
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "cuid string",
    "items": [
      {
        "id": "...",
        "cartId": "...",
        "mealId": "...",
        "quantity": "integer",
        "notes": "string | null",
        "meal": {
          "id": "...",
          "name": "...",
          "price": "string",
          "imageUrl": "...",
          "restaurantId": "...",
          "status": "AVAILABLE"
        },
        "itemTotal": "number (السعر × الكمية)"
      }
    ],
    "itemCount": "integer",
    "subtotal": "number"
  }
}
```

- **ملاحظة:** `itemCount` = عدد سطور السلة المميزة (وليس مجموع الكميات). السلة تُنشأ تلقائيًا إن لم تكن موجودة.

#### `PUT /api/cart/items/:mealId` — تحديث كمية وجبة في السلة

- **الحماية:** محمي
- **Request body:**

```json
{ "quantity": "integer ≥ 0 (مطلوب)" }
```

- **المنطق:** إذا كانت الكمية `0` → تُحذف الوجبة من السلة.
- **Response ناجح — `200 OK` (عند حذف):**

```json
{ "success": true, "message": "Item removed from cart." }
```

- **Response ناجح — `200 OK` (عند تحديث):**

```json
{ "success": true, "message": "Cart item updated.", "data": { ...item مع meal... } }
```

- **أخطاء:** `400` — "Item not found in cart." / validation

#### `DELETE /api/cart/items/:mealId` — إزالة وجبة من السلة

- **الحماية:** محمي
- **Response ناجح — `200 OK`:** `{ success: true, message: "Item removed from cart." }`
- **أخطاء:** `400` — "Item not found in cart."

#### `DELETE /api/cart` — إفراغ السلة

- **الحماية:** محمي
- **Response ناجح — `200 OK`:** `{ success: true, message: "Cart cleared." }`
- **أخطاء:** `400` — `401`

---

### 1.6 مجموعة Orders (الطلبات)

> كل الـ order endpoints تتطلب `authenticate`.

#### `POST /api/orders` — إنشاء طلب

- **الحماية:** محمي + `authorize("CUSTOMER")` فقط
- **Request body:**

```json
{
  "addressId": "string (مطلوب — يجب أن يكون عنوانًا للمستخدم نفسه)",
  "phone": "string يطابق /^05\\d{8}$/ (مطلوب)",
  "paymentMethod": "enum: CASH | CARD — اختياري، الافتراضي CASH",
  "notes": "string trim max 200 (اختياري)"
}
```

- **المنطق:** يُنشئ الطلب من محتوى السلة الحالية (subtotal + deliveryFee = total)، يتحقق أن السلة غير فارغة، العنوان ملك المستخدم، والمطعم `status === "OPEN"`. بعد الإنشاء **تُفرغ السلة**. رقم الطلب `ORD-YYYYMMDD-XXXX`.
- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": "cuid string",
    "orderNumber": "ORD-20260803-1234",
    "customerId": "cuid string",
    "restaurantId": "cuid string",
    "driverId": null,
    "addressId": "cuid string",
    "status": "PENDING",
    "paymentMethod": "CASH",
    "paymentStatus": "PENDING",
    "subtotal": "string (Decimal)",
    "deliveryFee": "string (Decimal)",
    "total": "string (Decimal)",
    "phone": "string",
    "notes": "string | null",
    "estimatedDeliveryAt": null,
    "createdAt": "ISO datetime",
    "updatedAt": "ISO datetime",
    "items": [
      {
        "id": "...", "orderId": "...", "mealId": "cuid | null", "mealName": "string",
        "quantity": "integer", "unitPrice": "string", "notes": "string | null",
        "createdAt": "ISO datetime"
      }
    ],
    "restaurant": { "id": "...", "name": "...", "phone": "..." },
    "address": { "...كل حقول Address..." }
  }
}
```

- **أخطاء:**
  - `400` — `{ "success": false, "message": "Cart is empty." }`
  - `400` — `{ "success": false, "message": "Address not found." }`
  - `400` — `{ "success": false, "message": "Restaurant not found." }`
  - `400` — `{ "success": false, "message": "Restaurant is not open." }`
  - `400` — validation — `401`/`403`

#### `GET /api/orders/my` — طلباتي (للـ CUSTOMER)

- **الحماية:** محمي + `authorize("CUSTOMER")`
- **Query params:** `page` (افتراضي 1)، `limit` (افتراضي 10)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "...", "orderNumber": "...", "customerId": "...", "restaurantId": "...",
        "driverId": null, "addressId": "...", "status": "PENDING",
        "paymentMethod": "CASH", "paymentStatus": "PENDING",
        "subtotal": "...", "deliveryFee": "...", "total": "...", "phone": "...",
        "notes": "...", "estimatedDeliveryAt": null,
        "createdAt": "...", "updatedAt": "...",
        "items": [ { ...OrderItem... } ],
        "restaurant": { "id": "...", "name": "..." }
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": "number", "totalPages": "number" }
  }
}
```

#### `GET /api/orders/restaurant/my` — طلبات مطعمي الواردة (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Query params:** `page` (افتراضي 1)، `limit` (افتراضي 10)
- **Response ناجح — `200 OK`:** نفس شكل getMyOrders لكن كل طلب يتضمن:
  - `items: [...]`
  - `customer: { id, firstName, lastName, phone }`
  - `driver: { id, firstName, lastName, phone } | null`
  - `address: {...}`
  - (بدون `restaurant`)

#### `GET /api/orders/:id` — تفاصيل طلب محدد

- **الحماية:** محمي (أي دور) — **التحكم بالوصول داخل الـ service** وليس بالراوتر:
  - `CUSTOMER`: يرى طلباته فقط، غير ذلك → `403 Access denied.`
  - `OWNER`: يرى طلبات مطعمه فقط، غير ذلك → `403 Access denied.`
  - `DRIVER` و `ADMIN`: **بدون أي قيد** — يرون أي طلب (ثغرة محتملة).
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "...", "orderNumber": "...", "customerId": "...", "restaurantId": "...",
    "driverId": null, "addressId": "...", "status": "...", "paymentMethod": "...",
    "paymentStatus": "...", "subtotal": "...", "deliveryFee": "...", "total": "...",
    "phone": "...", "notes": "...", "estimatedDeliveryAt": null,
    "createdAt": "...", "updatedAt": "...",
    "items": [ { ...OrderItem... } ],
    "customer": { "id": "...", "firstName": "...", "lastName": "...", "phone": "..." },
    "driver": { "id": "...", "firstName": "...", "lastName": "...", "phone": "..." } | null,
    "restaurant": { "id": "...", "name": "...", "phone": "..." },
    "address": { "...كل حقول Address..." }
  }
}
```

- **أخطاء:** `404` (Order not found.) — `403` (Access denied.) — `400`/`401`

#### `PATCH /api/orders/:id/status` — تحديث حالة الطلب (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:**

```json
{
  "status": "ACCEPTED | PREPARING | READY | ASSIGNED | PICKED_UP | ON_THE_WAY | DELIVERED | CANCELLED"
}
```

(ملاحظة: `PENDING` غير مسموح بالـ schema)

- **مصفوفة الانتقالات الصالحة (validTransitions) من الكود:**
  - `PENDING → ACCEPTED | CANCELLED`
  - `ACCEPTED → PREPARING | CANCELLED`
  - `PREPARING → READY`
  - `READY → ASSIGNED`
  - `ASSIGNED → PICKED_UP`
  - `PICKED_UP → ON_THE_WAY`
  - `ON_THE_WAY → DELIVERED`
  - أي انتقال غير مسموح → `400` برسالة "Cannot change status from {X} to {Y}."
- **Response ناجح — `200 OK`:** `{ success: true, message: "Order status updated.", data: { ...order مع items و restaurant: { id, name }... } }`
- **أخطاء:** `400` (Order not found. / Access denied. / Cannot change status...) — `401`/`403`

#### `PATCH /api/orders/:id/assign` — تعيين سائق للطلب (للـ OWNER)

- **الحماية:** محمي + `authorize("OWNER")`
- **Request body:**

```json
{ "driverId": "string (مطلوب)" }
```

- **المنطق:** يتطلب أن تكون حالة الطلب `READY`، وأن المستخدم المُشار إليه له دور `DRIVER`. عند النجاح يضبط `driverId` و يغيّر الحالة تلقائيًا إلى `ASSIGNED`.
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "message": "Driver assigned.",
  "data": {
    "...order..." , "status": "ASSIGNED",
    "items": [...],
    "driver": { "id": "...", "firstName": "...", "lastName": "...", "phone": "..." },
    "restaurant": { "id": "...", "name": "..." }
  }
}
```

- **أخطاء:** `400` — "Order not found." / "Access denied." / "Order must be READY to assign a driver." / "Invalid driver."

---

### 1.7 مجموعة Reviews (التقييمات)

#### `GET /api/reviews/restaurant/:restaurantId` — تقييمات مطعم (عام)

- **الحماية:** عام
- **Query params:** `page` (افتراضي 1)، `limit` (افتراضي 10)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "message": "Reviews fetched successfully.",
  "data": [
    {
      "id": "...",
      "orderId": "...",
      "customerId": "...",
      "restaurantId": "...",
      "rating": "number (Decimal) | null",
      "comment": "string | null",
      "createdAt": "ISO datetime",
      "customer": { "id": "...", "firstName": "...", "lastName": "..." }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": "number",
    "totalPages": "number"
  }
}
```

#### `GET /api/reviews/my` — تقييماتي

- **الحماية:** محمي (أي دور)
- **Query params:** `page`، `limit`
- **Response ناجح — `200 OK`:** نفس الشكل أعلاه لكن كل تقييم يتضمن `restaurant: { id, name }` بدل customer.

#### `POST /api/reviews` — إنشاء تقييم

- **الحماية:** محمي
- **Request body:**

```json
{
  "orderId": "string (مطلوب)",
  "rating": "number بين 1 و 5 (مطلوب)",
  "comment": "string trim max 500 (اختياري)"
}
```

- **المنطق:** الطلب يجب أن يكون للمستخدم نفسه، وحالته `DELIVERED`، ولم يُقيَّم من قبل (orderId فريد).
- **Response ناجح — `201 Created`:**

```json
{
  "success": true,
  "message": "Review created successfully.",
  "data": {
    "id": "...",
    "orderId": "...",
    "customerId": "...",
    "restaurantId": "...",
    "rating": "number",
    "comment": "string | null",
    "createdAt": "...",
    "customer": { "id": "...", "firstName": "...", "lastName": "..." },
    "restaurant": { "id": "...", "name": "..." }
  }
}
```

- **أخطاء:**
  - `403` — `{ "success": false, "message": "Access denied." }`
  - `409` — `{ "success": false, "message": "You have already reviewed this order." }`
  - `400` — "Order not found." أو "You can only review delivered orders."
  - `500` — أي خطأ آخر (عبر next → errorHandler)

#### `DELETE /api/reviews/:id` — حذف تقييمي

- **الحماية:** محمي
- **Response ناجح — `200 OK`:** `{ "success": true, "message": "Review deleted successfully.", "data": null }`
- **أخطاء:** `403` (Access denied.) — `404` (Review not found.) — `500`

---

### 1.8 مجموعة Admin (الإدارة) — كلها `authenticate` + `authorize("ADMIN")`

#### `GET /api/admin/users` — قائمة المستخدمين

- **Query params:** `page` (1)، `limit` (10)، `role` (اختياري — فلترة حسب اسم الدور مثل `CUSTOMER`)
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": [
    {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "email": "...",
      "phone": "...",
      "status": "ACTIVE | INACTIVE | BLOCKED",
      "isVerified": "boolean",
      "profileImage": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "role": { "id": "...", "name": "..." }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": "number",
    "totalPages": "number"
  }
}
```

#### `GET /api/admin/users/:id` — تفاصيل مستخدم

- **Response ناجح — `200 OK`:** `{ success: true, message: "User fetched successfully.", data: { ...user + lastLoginAt + addresses... } }`
- **أخطاء:** `404` (User not found.)

#### `PATCH /api/admin/users/:id/status` — تغيير حالة مستخدم

- **Request body:** `{ "status": "ACTIVE | INACTIVE | BLOCKED" }`
- **Response ناجح — `200 OK`:** `{ success: true, message: "User status updated successfully.", data: { id, firstName, lastName, email, status, role: { id, name } } }`
- **أخطاء:** `404` — `400` (validation)

#### `GET /api/admin/restaurants` — قائمة المطاعم

- **Query params:** `page`، `limit`، `status` (اختياري — مثل `OPEN`)
- **Response ناجح — `200 OK`:** `{ success: true, message: "Restaurants fetched successfully.", data: [ { ...Restaurant + owner... } ], pagination: {...} }`

#### `GET /api/admin/restaurants/:id` — تفاصيل مطعم

- **Response ناجح — `200 OK`:** `{ success: true, message: "Restaurant fetched successfully.", data: { ...Restaurant مع owner (مع phone) + address + _count: { categories, meals, orders, reviews }... } }`
- **أخطاء:** `404` (Restaurant not found.)

#### `PATCH /api/admin/restaurants/:id/status` — تغيير حالة مطعم

- **Request body:** `{ "status": "OPEN | CLOSED | SUSPENDED" }`
- **Response ناجح — `200 OK`:** `{ success: true, message: "Restaurant status updated successfully.", data: { ...Restaurant صف كامل بدون includes... } }`
- **أخطاء:** `404` — `400`

---

### 1.9 مجموعة Dashboard (لوحة المطعم)

#### `GET /api/dashboard` — إحصائيات لوحة الـ OWNER

- **الحماية:** محمي + `authorize("OWNER")`
- **Response ناجح — `200 OK`:**

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "restaurant": { "id": "...", "name": "...", "status": "OPEN" },
    "orders": { "total": "number", "today": "number", "thisWeek": "number", "thisMonth": "number" },
    "revenue": { "total": "number", "today": "number", "thisWeek": "number", "thisMonth": "number" },
    "reviews": { "total": "number", "averageRating": "number | null" },
    "ordersByStatus": { "PENDING": "number", "DELIVERED": "number", "...أي حالة موجودة..." },
    "recentOrders": [
      {
        "...order..." ,
        "customer": { "id": "...", "firstName": "...", "lastName": "..." },
        "items": [ { "mealName": "...", "quantity": "number", "unitPrice": "string" } ]
      }
    ]
  }
}
```

- **ملاحظات:** الإيرادات (revenue) تُحسب فقط للطلبات `DELIVERED`. `recentOrders` آخر 5 طلبات.
- **أخطاء:** `400` — "Restaurant not found." (إذا لم يكن للمالك مطعم) — `500` — `401`/`403`

---

## 2. آلية المصادقة (Authentication)

### نوع التوكن

- **JWT** (jsonwebtoken). لا يوجد Session. لا يوجد تخزين للتوكن على الخادم.
- يُنشأ الـ access token بـ `JWT_SECRET` والـ refresh token بـ `JWT_REFRESH_SECRET` (`src/utils/jwt.js`).

### شكل الـ JWT Payload (بالضبط)

كلا التوكنين (access و refresh) يحملان نفس الـ payload:

```json
{
  "id": "userId (cuid)",
  "role": "CUSTOMER | OWNER | DRIVER | ADMIN",
  "email": "email"
}
```

المفاتيح بالضبط: `id` و `role` و `email`. (لا يوجد `userId` ولا `userType`).

### مدة الصلاحية (بالأرقام الفعلية من الكود)

- **Access token:** `JWT_EXPIRES_IN` — القيمة في `.env` الحالية: `1d` (يوم واحد). الافتراضي في الكود: `"1d"`.
- **Refresh token:** `REFRESH_EXPIRES_IN` — القيمة في `.env` الحالية: `7d` (7 أيام). الافتراضي في الكود: `"7d"`.

### كيف يستقبل الباك إند التوكن

- **Header فقط:** `Authorization: Bearer <access_token>`
- middleware `authenticate` يتحقق من: `req.headers.authorization` يبدأ بـ `"Bearer "`.
- **لا يوجد Cookie support إطلاقًا.**
- على كل طلب محمي: يُفك التشفير، ثم **يُجلب المستخدم من قاعدة البيانات** (`prisma.user.findUnique` مع `role`)، ويتحقق أن `user.status === "ACTIVE"`، ثم يضع في `req.user`:

```js
{ id, firstName, lastName, email, phone, role: user.role.name }
```

### رسائل أخطاء الـ middleware (بالضبط)

- لا يوجد header أو لا يبدأ بـ Bearer → `401` `"Access denied. No token provided."`
- توكن منتهي (TokenExpiredError) → `401` `"Token expired."`
- توكن غير صالح (JsonWebTokenError) → `401` `"Invalid token."`
- المستخدم غير موجود في DB → `401` `"Invalid token. User not found."`
- `user.status !== "ACTIVE"` → `403` `"Account is not active."`
- `authorize(roles)` والدور غير مسموح → `403` `"Access denied. Insufficient permissions."`

### تجديد التوكن (Refresh Token)

- **مفقود تمامًا.** الـ refresh token يُنشأ ويُعاد في استجابة login/register فقط، لكن **لا يوجد أي endpoint** يستخدمه أو يتحقق منه (`grep` على `refresh` في `src` لا يجد أي route أو دالة تستهلكه). لا يوجد `POST /api/auth/refresh`.
- بمعنى آخر: عند انتهاء الـ access token، لا يوجد طريقة لتجديده عبر الـ API — الفرونت إند عليه أن يعيد تسجيل الدخول.

### Rate Limiting على login/register

- **مطبّق فعليًا** على `/api/auth/register` و `/api/auth/login` فقط: `rateLimiter(15 * 60 * 1000, 10)`.
- الحد: **10 طلبات لكل 15 دقيقة لكل IP**.
- التطبيق: `src/middlewares/rateLimiter.js` — مؤقت **في الذاكرة** (Map) مفتوح بـ `req.ip`. يُمسح عند إعادة تشغيل الخادم، ولا يعمل مع أكثر من instance.
- عند التجاوز → `429` `{ "success": false, "message": "Too many requests. Please try again later." }`
- **لا يوجد** Rate limiting على أي endpoint آخر.

---

## 3. نماذج البيانات (Prisma Schema) — بالتفصيل الحرفي

> المصدر: `server/prisma/schema.prisma`. قاعدة بيانات: PostgreSQL. كل معرفات primary key من نوع `String` بقيمة `cuid()`.

### ENUMs (القيم المسموحة حرفيًا)

| الـ Enum           | القيم                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `UserStatus`       | `ACTIVE`, `INACTIVE`, `BLOCKED`                                                                              |
| `RestaurantStatus` | `OPEN`, `CLOSED`, `SUSPENDED`                                                                                |
| `MealStatus`       | `AVAILABLE`, `OUT_OF_STOCK`, `HIDDEN`                                                                        |
| `OrderStatus`      | `PENDING`, `ACCEPTED`, `PREPARING`, `READY`, `ASSIGNED`, `PICKED_UP`, `ON_THE_WAY`, `DELIVERED`, `CANCELLED` |
| `PaymentMethod`    | `CASH`, `CARD`                                                                                               |
| `PaymentStatus`    | `PENDING`, `PAID`, `FAILED`                                                                                  |

### Model `Role`

| الحقل         | النوع    | ملاحظات     |
| ------------- | -------- | ----------- |
| `id`          | String   | PK, cuid    |
| `name`        | String   | `@unique`   |
| `description` | String?  |             |
| `createdAt`   | DateTime | default now |
| `updatedAt`   | DateTime | @updatedAt  |
| `users`       | User[]   | علاقة       |

> أدوار الـ seed: `ADMIN`, `OWNER`, `CUSTOMER`, `DRIVER`.

### Model `User`

| الحقل            | النوع       | ملاحظات                           |
| ---------------- | ----------- | --------------------------------- |
| `id`             | String      | PK, cuid                          |
| `roleId`         | String      | FK → Role.id (ON DELETE RESTRICT) |
| `firstName`      | String      |                                   |
| `lastName`       | String      |                                   |
| `email`          | String      | `@unique`                         |
| `phone`          | String      | `@unique`                         |
| `password`       | String      | مشفّر bcrypt (10 rounds)          |
| `profileImage`   | String?     |                                   |
| `status`         | UserStatus  | default `ACTIVE`                  |
| `isVerified`     | Boolean     | default `false`                   |
| `lastLoginAt`    | DateTime?   |                                   |
| `createdAt`      | DateTime    |                                   |
| `updatedAt`      | DateTime    |                                   |
| `deletedAt`      | DateTime?   |                                   |
| `role`           | Role        | relation                          |
| `addresses`      | Address[]   | relation (Cascade)                |
| `restaurant`     | Restaurant? | relation                          |
| `cart`           | Cart?       | relation (Cascade)                |
| `customerOrders` | Order[]     | relation "CustomerOrders"         |
| `driverOrders`   | Order[]     | relation "DriverOrders"           |
| `reviews`        | Review[]    | relation                          |

### Model `Address`

| الحقل                     | النوع       | ملاحظات                      |
| ------------------------- | ----------- | ---------------------------- |
| `id`                      | String      | PK, cuid                     |
| `userId`                  | String      | FK → User.id (Cascade)       |
| `label`                   | String      |                              |
| `city`                    | String      |                              |
| `street`                  | String      |                              |
| `building`                | String?     |                              |
| `details`                 | String?     |                              |
| `latitude`                | Decimal?    | `@db.Decimal(10, 7)`         |
| `longitude`               | Decimal?    | `@db.Decimal(10, 7)`         |
| `isDefault`               | Boolean     | default `false`              |
| `user`                    | User        | relation                     |
| `restaurant`              | Restaurant? | relation "RestaurantAddress" |
| `orders`                  | Order[]     | relation                     |
| `createdAt` / `updatedAt` | DateTime    |                              |

### Model `Restaurant`

| الحقل                                   | النوع            | ملاحظات                               |
| --------------------------------------- | ---------------- | ------------------------------------- |
| `id`                                    | String           | PK, cuid                              |
| `ownerId`                               | String           | `@unique`, FK → User.id (Restrict)    |
| `addressId`                             | String           | `@unique`, FK → Address.id (Restrict) |
| `name`                                  | String           |                                       |
| `slug`                                  | String           | `@unique`                             |
| `description`                           | String?          |                                       |
| `phone`                                 | String           |                                       |
| `email`                                 | String?          |                                       |
| `logoUrl`                               | String?          |                                       |
| `coverImageUrl`                         | String?          |                                       |
| `deliveryFee`                           | Decimal          | `@db.Decimal(10, 2)`                  |
| `minimumOrder`                          | Decimal          | `@db.Decimal(10, 2)`                  |
| `estimatedDeliveryTime`                 | Int?             |                                       |
| `status`                                | RestaurantStatus | default `OPEN`                        |
| `categories`                            | Category[]       | relation (Cascade)                    |
| `meals`                                 | Meal[]           | relation (Cascade)                    |
| `orders`                                | Order[]          | relation                              |
| `reviews`                               | Review[]         | relation                              |
| `createdAt` / `updatedAt` / `deletedAt` | DateTime         |                                       |

### Model `Category`

| الحقل                                   | النوع      | ملاحظات                          |
| --------------------------------------- | ---------- | -------------------------------- |
| `id`                                    | String     | PK, cuid                         |
| `restaurantId`                          | String     | FK → Restaurant.id (Cascade)     |
| `name`                                  | String     | `@@unique([restaurantId, name])` |
| `imageUrl`                              | String?    |                                  |
| `restaurant`                            | Restaurant | relation                         |
| `meals`                                 | Meal[]     | relation                         |
| `createdAt` / `updatedAt` / `deletedAt` | DateTime   |                                  |

### Model `Meal`

| الحقل                                   | النوع       | ملاحظات                      |
| --------------------------------------- | ----------- | ---------------------------- |
| `id`                                    | String      | PK, cuid                     |
| `restaurantId`                          | String      | FK → Restaurant.id (Cascade) |
| `categoryId`                            | String      | FK → Category.id (Restrict)  |
| `name`                                  | String      |                              |
| `description`                           | String?     |                              |
| `imageUrl`                              | String?     |                              |
| `price`                                 | Decimal     | `@db.Decimal(10, 2)`         |
| `preparationTime`                       | Int?        |                              |
| `isFeatured`                            | Boolean     | default `false`              |
| `status`                                | MealStatus  | default `AVAILABLE`          |
| `cartItems`                             | CartItem[]  | relation                     |
| `orderItems`                            | OrderItem[] | relation                     |
| `createdAt` / `updatedAt` / `deletedAt` | DateTime    |                              |

### Model `Cart`

| الحقل                     | النوع      | ملاحظات                           |
| ------------------------- | ---------- | --------------------------------- |
| `id`                      | String     | PK, cuid                          |
| `customerId`              | String     | `@unique`, FK → User.id (Cascade) |
| `customer`                | User       | relation                          |
| `items`                   | CartItem[] | relation (Cascade)                |
| `createdAt` / `updatedAt` | DateTime   |                                   |

### Model `CartItem`

| الحقل           | النوع     | ملاحظات                      |
| --------------- | --------- | ---------------------------- |
| `id`            | String    | PK, cuid                     |
| `cartId`        | String    | FK → Cart.id (Cascade)       |
| `mealId`        | String    | FK → Meal.id (Restrict)      |
| `quantity`      | Int       | default `1`                  |
| `notes`         | String?   |                              |
| `cart` / `meal` | relations | `@@unique([cartId, mealId])` |

### Model `Order`

| الحقل                     | النوع         | ملاحظات                                |
| ------------------------- | ------------- | -------------------------------------- |
| `id`                      | String        | PK, cuid                               |
| `orderNumber`             | String        | `@unique` (تنسيق `ORD-YYYYMMDD-XXXX`)  |
| `customerId`              | String        | FK → User.id "CustomerOrders"          |
| `restaurantId`            | String        | FK → Restaurant.id                     |
| `driverId`                | String?       | FK → User.id "DriverOrders" (SET NULL) |
| `addressId`               | String        | FK → Address.id                        |
| `status`                  | OrderStatus   | default `PENDING`                      |
| `paymentMethod`           | PaymentMethod | default `CASH`                         |
| `paymentStatus`           | PaymentStatus | default `PENDING`                      |
| `subtotal`                | Decimal       | `@db.Decimal(10, 2)`                   |
| `deliveryFee`             | Decimal       | `@db.Decimal(10, 2)`                   |
| `total`                   | Decimal       | `@db.Decimal(10, 2)`                   |
| `phone`                   | String        |                                        |
| `notes`                   | String?       |                                        |
| `estimatedDeliveryAt`     | DateTime?     |                                        |
| `items`                   | OrderItem[]   | relation (Cascade)                     |
| `review`                  | Review?       | relation                               |
| `createdAt` / `updatedAt` | DateTime      |                                        |

### Model `OrderItem`

| الحقل       | النوع    | ملاحظات                        |
| ----------- | -------- | ------------------------------ |
| `id`        | String   | PK, cuid                       |
| `orderId`   | String   | FK → Order.id (Cascade)        |
| `mealId`    | String?  | FK → Meal.id (SET NULL)        |
| `mealName`  | String   | (لقطة من اسم الوجبة وقت الطلب) |
| `quantity`  | Int      |                                |
| `unitPrice` | Decimal  | `@db.Decimal(10, 2)`           |
| `notes`     | String?  |                                |
| `createdAt` | DateTime |                                |

### Model `Review`

| الحقل          | النوع    | ملاحظات                                                                |
| -------------- | -------- | ---------------------------------------------------------------------- |
| `id`           | String   | PK, cuid                                                               |
| `orderId`      | String   | `@unique`, FK → Order.id (Cascade)                                     |
| `customerId`   | String   | FK → User.id                                                           |
| `restaurantId` | String   | FK → Restaurant.id                                                     |
| `rating`       | Decimal? | `@db.Decimal(65, 30)` — في الـ schema اختياري، لكن الـ API يطلبه (1-5) |
| `comment`      | String?  |                                                                        |
| `createdAt`    | DateTime |                                                                        |

### العلاقات الرئيسية بين الجداول (بالمختصر)

- **User 1—1 Role** (`roleId`).
- **User 1—N Address** (Cascade) — المطعم يملك عنوانًا مستقلًا عبر `Restaurant.addressId` (1—1 مع Address).
- **User 1—1 Restaurant** (بصفتك owner، `ownerId` unique).
- **User 1—1 Cart** (`customerId` unique) — **Cart 1—N CartItem** — **CartItem N—1 Meal**.
- **User 1—N Order** بصفتين: `customerOrders` و `driverOrders` (driver اختياري).
- **Restaurant 1—N Category** (Cascade) — **Restaurant 1—N Meal** (Cascade) — **Meal N—1 Category** (Restrict).
- **Order 1—N OrderItem** (Cascade) — OrderItem N—1 Meal (SET NULL).
- **Order 1—1 Review** (orderId unique) — Review N—1 User (customer) — Review N—1 Restaurant.
- **Order N—1 Address** (العنوان سيكون أيضًا ملكًا للمستخدم، لكن العلاقة تشير إلى Address مباشرة).

---

## 4. متغيرات البيئة (Environment Variables)

المصدر: `server/.env` + `src/utils/jwt.js` + `src/config/prisma.js` + `src/server.js`. (القيم الفعلية السرية غير مذكورة هنا عمدًا.)

| المتغير              | الوظيفة                                                                                                                 | الافتراضي إن لم يوجد                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `PORT`               | منفذ الخادم                                                                                                             | `5000`                                                     |
| `DATABASE_URL`       | سلسلة اتصال PostgreSQL (تُستخدم عبر `@prisma/adapter-pg` في `src/config/prisma.js` وفي `prisma.config.js` للـ CLI/seed) | لا يوجد                                                    |
| `JWT_SECRET`         | سر توقيع/تحقق الـ access token                                                                                          | لا يوجد (إن لم يُحدد سيُمرر `undefined` لـ jwt.sign → خطأ) |
| `JWT_REFRESH_SECRET` | سر توقيع الـ refresh token                                                                                              | لا يوجد                                                    |
| `JWT_EXPIRES_IN`     | مدة صلاحية access token                                                                                                 | `"1d"`                                                     |
| `REFRESH_EXPIRES_IN` | مدة صلاحية refresh token                                                                                                | `"7d"`                                                     |

> ملاحظة: في `.env` الحالية قيمتا `JWT_SECRET` و `JWT_REFRESH_SECRET` متطابقتان (ملاحظة أمنية — انظر القسم 5).
> **لا يوجد** أي متغير لـ URL أساسي خارجي (لا NEXT_PUBLIC_API_URL ولا شيء مشابه) في الباك إند — الفرونت إند عليه تحديد base URL بنفسه (افتراضيًا `http://localhost:5000/api`).

---

## 5. فجوات وملاحظات صريحة

### 5.1 مقابل قائمة "العقد المتوقع"

| العقد المتوقع                         | الحالة الفعلية                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register                              | ✅ موجود — `POST /api/auth/register`                                                                                                                                                                                                  |
| Login                                 | ✅ موجود — `POST /api/auth/login`                                                                                                                                                                                                     |
| Refresh Token                         | ❌ **مفقود** — لا يوجد أي endpoint. الـ refresh token يُولَّد ويُعاد فقط في login/register ولا يمكن استخدامه أبدًا                                                                                                                    |
| Logout                                | ⚠️ موجود شكليًا — `POST /api/auth/logout` لكنه no-op (لا يُبطل التوكن؛ على الفرونت إند حذفه محليًا)                                                                                                                                   |
| Get Current User (me)                 | ✅ موجود — `GET /api/auth/profile`                                                                                                                                                                                                    |
| Forgot Password                       | ❌ **مفقود**                                                                                                                                                                                                                          |
| Reset Password                        | ❌ **مفقود**                                                                                                                                                                                                                          |
| Get Restaurants List                  | ✅ موجود — `GET /api/restaurants`                                                                                                                                                                                                     |
| Get Restaurant Details + Menu         | ⚠️ جزئي — التفاصيل في `GET /api/restaurants/:slug` (بدون المنيو)، والمنيو يحتاج استدعاءين إضافيين: `GET /api/categories/restaurant/:restaurantId` + `GET /api/meals/restaurant/:restaurantId`. **لا يوجد endpoint واحد يجمع الاثنين** |
| Create Order                          | ✅ موجود — `POST /api/orders`                                                                                                                                                                                                         |
| Get User Orders                       | ✅ موجود — `GET /api/orders/my`                                                                                                                                                                                                       |
| Get Order Details                     | ✅ موجود — `GET /api/orders/:id`                                                                                                                                                                                                      |
| Update Order Status (restaurant-side) | ✅ موجود — `PATCH /api/orders/:id/status`                                                                                                                                                                                             |
| Get Restaurant Incoming Orders        | ✅ موجود — `GET /api/orders/restaurant/my`                                                                                                                                                                                            |

### 5.2 تضاربات / عدم اتساق داخل الكود

1. **Refresh token غير قابل للاستخدام** — يولَّد في `auth.service.js` (login/register) لكن لا يوجد endpoint أو middleware يستخدمه إطلاقًا. أدى لوجود ميزة "ميتة" في الـ API.
2. **Login لا يتحقق من `user.status`** — مستخدم BLOCKED/INACTIVE يستطيع تسجيل الدخول والحصول على توكن؛ الحجب يحدث فقط عند استخدام التوكن في طلب لاحق (via `authenticate`).
3. **`GET /api/orders/:id` بدون قيد للـ DRIVER و ADMIN** — قيد الوصول في `order.service.js` يفحص `CUSTOMER` و `OWNER` فقط، فـ DRIVER و ADMIN يرون أي طلب.
4. **Cart غير مقيد بالدور** — كل مسارات `/api/cart` تحتاج `authenticate` فقط، في حين أن المفهوم تصميميًا للسلة customer-only. (أي دور يستطيع استخدام السلة.)
5. **لا يوجد أي endpoint خاص بالـ DRIVER رغم وجود الدور** — لا "طلباتي كسائق"، لا تحديث حالة تسليم (`PICKED_UP`, `ON_THE_WAY`, `DELIVERED` لا يمكن أن يضبطها إلا الـ OWNER عبر `PATCH /api/orders/:id/status`). السائق عمليًا غير قادر على العمل عبر الـ API.
6. **حالة الوجبة `status` غير قابلة للتغيير** — لا حقل `status` في `createMealSchema`/`updateMealSchema` ولا endpoint لها. كل الوجبات تبقى `AVAILABLE`. كما أن `GET /api/meals/restaurant/:restaurantId` (العام) لا يفلتر حسب status، فتظهر وجبات OUT_OF_STOCK/HIDDEN للعميل.
7. **`paymentStatus` و `estimatedDeliveryAt` في Order لا يُضبطان أبدًا** — يبقيان على القيم الافتراضية (PENDING / null) مهما حدث.
8. **`minimumOrder` غير مُطبق** — يُحفظ في المطعم لكن `createOrder` لا يتحقق منه.
9. **عند إنشاء الطلب لا يُعاد التحقق من توفر الوجبات** — يُتحقق من `status === "AVAILABLE"` عند الإضافة للسلة فقط، وليس وقت الطلب.
10. **`isDefault` للعناوين بلا منطق** — لا يوجد كود يجعل العنوان الجديد هو الافتراضي أو يلغي الافتراضيات الأخرى.
11. **اسم الحقل متّسق (`role`) — لا يوجد `userType`** — كل الاستجابات تستخدم `role` (قيمة الـ enum). لم أجد أي تسمية مختلفة `userType` في الباك إند.
12. **`errorHandler` العام يعيد `500` دائمًا** — أي خطأ غير معالج يمر عبر `next(error)` يظهر كـ `{"success": false, "message": "Internal server error."}` حتى لو كان خطأ 404 أو 400 منطقيًا.
13. **لا يوجد معالج 404 للـ API** — مسارات غير موجودة ترجع صفحة HTML الافتراضية من Express (`Cannot GET /...`) وليس JSON.
14. **المراجعات: حالة `delivered` تُفحص بحساسية** — رسالة الخطأ `"You can only review delivered orders."` تُفحص عبر `includes("delivered")` وهي هشة تجاه تغيير النص، لكنها تعمل حاليًا.
15. **Rate limiter في الذاكرة فقط** — غير مناسب لتعدد الـ instances (مناسب للتطوير فقط).

### 5.3 Endpoints موجودة لكنها غير واضحة الغرض / بلا توثيق

- **`PATCH /api/meals/:id/feature`** — موجودة وتعمل، لكن لا ذكر لها في أي واجهة/توثيق في الفرونت إند؛ الغرض منها تبديل `isFeatured`.
- **`GET /api/orders/restaurant/my`** — موجودة وهي "الطلبات الواردة للمطعم"، لكن **بدون فلترة حسب الحالة** — لا يوجد param مثل `?status=PENDING` رغم أن الاسم يوحي بأنها للطلبات "الواردة".
- **`GET /api/categories/restaurant/:restaurantId`** و **`GET /api/meals/restaurant/:restaurantId`** — عامتان بشكل كامل، والغرض منهما خدمة صفحة المطعم العامة، لكن لا يوجد endpoint مركّب يجلب "مطعم + منيو" في استجابة واحدة.
- **`GET /api/dashboard`** — موجودة للـ OWNER فقط وتحوي إحصائيات مفيدة، ولا يوجد مقابل لها في أي توثيق سابق.

### 5.4 ملاحظات أمنية إضافية (من الكود)

- `JWT_SECRET` و `JWT_REFRESH_SECRET` متطابقان حاليًا في `.env`.
- كلمة سر الـ admin في `prisma/seed.js` **ثابتة ومثبتة في الكود** (`Admin$$123` / `admin@food.com`) — يجب تغييرها فورًا لأي بيئة إنتاج.
- CORS مفتوح بالكامل (`app.use(cors())` بدون خيارات → كل الأصول مسموحة).
- التوكن يُحمل من DB في كل طلب محمي (مكلف لكنه يسمح بحجب BLOCKED فورًا).
- كلمة السر تُخزَّن بفعل bcrypt (10 rounds) — جيد.
- الحقول الحساسة (password) غير مُسترجَعة في أي استجابة (تم التحقق: كل الـ select تُستثني `password`).

### 5.5 سلوكيات يجب الانتباه لها عند الربط

- **كل قيم الأموال في الاستجابات هي Strings** (من Decimal في Prisma) — يجب تحويلها في الفرونت إند.
- **`itemCount` في السلة = عدد الأسطر المميزة وليس مجموع الكميات.**
- **عند إنشاء الطلب تُفرغ السلة تلقائيًا.**
- **الحالة الافتراضية للطلب `PENDING`** ولا يمكن ضبطها عبر `PATCH /api/orders/:id/status` (غير موجودة في الـ enum الخاص بها) — أول تحديث مسموح هو `ACCEPTED` أو `CANCELLED`.
- **`register` لا يسمح بدور `ADMIN`**، والدوران `OWNER` و `DRIVER` متاحان للتسجيل الذاتي بدون أي عملية موافقة.
- **لا يوجد تحقق إيميل** — حقل `isVerified` يبقى `false` دائمًا بعد التسجيل.
