const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

// Load .env so DATABASE_URL exists even when the seed runs directly
// (node prisma/seed.js), not only via `npx prisma db seed`.
require("dotenv/config");

// إنشاء الاتصال
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// إنشاء Adapter
const adapter = new PrismaPg(pool);

// إنشاء PrismaClient مع Adapter
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 60 * 60 * 1000;

const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;
const COVER = (id) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

// ========================
// FIXTURES
// ========================

// Restaurants keyed by their public slug. Slugs stay ASCII and match the ids
// the customer app used for its mock links (/restaurants/baladna, ...) so the
// swap from mock → real data keeps every existing link working.
const RESTAURANT_FIXTURES = [
  {
    slug: "baladna",
    name: "مطعم بلدنا",
    cuisine: "مأكولات شعبية",
    description: "الأكل الشعبي الفلسطيني الأصيل — مسخّن، منسف، مقلوبة وكبسة.",
    phone: "0592000001",
    ownerEmail: "owner.baladna@wajba.ps",
    ownerPhone: "0593000001",
    ownerFirstName: "ياسر",
    ownerLastName: "البلداوي",
    deliveryFee: 5,
    minimumOrder: 30,
    estimatedDeliveryTime: 40,
    city: "غزة",
    street: "شارع عمر المختار — وسط البلد",
    cover: "1504674900247-0877df9cc836",
    categories: [
      {
        name: "أطباق رئيسية",
        items: [
          {
            name: "مسخّن دجاج",
            description:
              "دجاج مقطّع على خبز الطابون مع بصل مسكّر وصنوبر مقلي وسماق — أكلة العيلة الشعبية الحقيقية.",
            price: 38,
            image: "1532550907401-a500c9a57435",
            prep: 30,
          },
          {
            name: "منسف",
            description:
              "أرز مفتّل بلبن الجميد مع لحم غنم طري وصنوبر وسماق — مناسف الضيافة بإيد أمهاتنا.",
            price: 45,
            image: "1504674900247-0877df9cc836",
            prep: 45,
          },
          {
            name: "مقلوبة",
            description:
              "أرز مع دجاج وبتنجان، لونها ذهبي من التحمرة — بتتنقلب على صحنك وهي عالنار.",
            price: 32,
            image: "1512058564366-18510be2db19",
            prep: 40,
          },
          {
            name: "كبسة دجاج",
            description:
              "أرز بسمتي متبّل بالهيل والقرفة مع دجاج مشوي ومكسرات على الطريقة الخليجية.",
            price: 30,
            image: "1547592180-85f173990554",
            prep: 35,
          },
        ],
      },
      {
        name: "سلطات ومقبلات",
        items: [
          {
            name: "حمص بالطحينة",
            description:
              "حمص كريمي بالطحينة وزيت زيتون وصنوبر — بيفتح النفس قبل الأكلة.",
            price: 9,
            image: "1546833999-b9f581a1996d",
            prep: 10,
          },
          {
            name: "تبولة",
            description:
              "بقدونس طازج وبرغل ناعم وطماطم ونعناع بخلطة زيت وليمون منعشة.",
            price: 10,
            image: "1540189549336-e6e99c3679fe",
            prep: 10,
          },
        ],
      },
      {
        name: "حلويات",
        items: [
          {
            name: "كنافة نابلسية",
            description:
              "كنافة عجناط بالجبنة الحلوم طرية مع قطر وفستق حلبي — من قلب نابلس.",
            price: 16,
            image: "1571115177098-24ec42ed204d",
            prep: 15,
          },
        ],
      },
    ],
  },
  {
    slug: "al-buhhar",
    name: "مطعم ومسمكة البحّار",
    cuisine: "مطبخ بحري",
    description: "أطيب أصناف البحر الطازج — صيادية ورقاد مشوي وجمبري.",
    phone: "0592000002",
    ownerEmail: "owner.buhhar@wajba.ps",
    ownerPhone: "0593000002",
    ownerFirstName: "عمّار",
    ownerLastName: "البحّار",
    deliveryFee: 8,
    minimumOrder: 40,
    estimatedDeliveryTime: 35,
    city: "غزة",
    street: "شارع البحر — حي الرمال",
    cover: "1547496502-affa22d38842",
    categories: [
      {
        name: "أطباق بحرية",
        items: [
          {
            name: "صيادية",
            description:
              "أرز أصفر مع سمك وبصل مكرمل — أكلة البحر الغزاوية الأصلية.",
            price: 36,
            image: "1559847844-5315695dadae",
            prep: 40,
          },
          {
            name: "سمك رقاد مشوي",
            description: "رقاد طازج مشوي عالفحم مع ليمون وبصل وخضار.",
            price: 45,
            image: "1615141982883-c7ad0e69fd62",
            prep: 35,
          },
          {
            name: "سمك مقلي",
            description: "سمك بلطي مقلي ذهبي مع سلطة طحينة وخبز طازة.",
            price: 40,
            image: "1547496502-affa22d38842",
            prep: 30,
          },
          {
            name: "جمبري مقلي",
            description: "جمبري مقرمش مع ثوم وليمون — جربتو والطعم بيحكي.",
            price: 55,
            image: "1534080564583-6be75777b70a",
            prep: 30,
            available: false,
          },
        ],
      },
    ],
  },
  {
    slug: "al-taj",
    name: "مطعم التاج",
    cuisine: "بيتا وسندويشات",
    description: "شاورما وسندويشات على أصولها — خروف ودجاج وكبدة.",
    phone: "0592000003",
    ownerEmail: "owner.taj@wajba.ps",
    ownerPhone: "0593000003",
    ownerFirstName: "رامي",
    ownerLastName: "التّاجي",
    deliveryFee: 5,
    minimumOrder: 20,
    estimatedDeliveryTime: 30,
    city: "غزة",
    street: "حي الرمال — شارع النصر",
    cover: "1633321702518-7feccafb94d5",
    categories: [
      {
        name: "شاورما وسندويشات",
        items: [
          {
            name: "شاورما دجاج",
            description: "شاورما دجاج مع مخلل وخضار وثومية وبطاطا.",
            price: 14,
            image: "1525755662778-989d0524087e",
            prep: 15,
          },
          {
            name: "سندويش لحم",
            description: "لحم مفروم متبّل بالبهارات مع بصل وبقدونس.",
            price: 18,
            image: "1608039755401-742074f0548d",
            prep: 15,
          },
          {
            name: "سندويش كبدة",
            description: "كبدة غنم مقلية بالثوم والليمون مع بقدونس.",
            price: 15,
            image: "1565557623262-b51c2513a641",
            prep: 15,
          },
          {
            name: "شاورما خروف",
            description: "شاورما خروف بتتبيلة سرية مع خبز صاج وثومية.",
            price: 16,
            image: "1633321702518-7feccafb94d5",
            prep: 15,
            available: false,
          },
        ],
      },
    ],
  },
  {
    slug: "abu-saud",
    name: "حلويات أبو السعود",
    cuisine: "حلويات شرقية",
    description: "حلويات بلدية على الأصول — كنافة نابلسية وبسبوسة ومعمول.",
    phone: "0592000004",
    ownerEmail: "owner.abusaad@wajba.ps",
    ownerPhone: "0593000004",
    ownerFirstName: "أبو السعود",
    ownerLastName: "الحلو",
    deliveryFee: 4,
    minimumOrder: 15,
    estimatedDeliveryTime: 25,
    city: "غزة",
    street: "شارع الوحدة",
    cover: "1571115177098-24ec42ed204d",
    categories: [
      {
        name: "حلويات شرقية",
        items: [
          {
            name: "كنافة نابلسية",
            description: "كنافة عجناط بالجبنة الحلوم والقطر والفستق.",
            price: 18,
            image: "1571115177098-24ec42ed204d",
            prep: 15,
          },
          {
            name: "بسبوسة",
            description: "بسبوسة سملية باللوز والقطر.",
            price: 10,
            image: "1551024506-0bccd828d307",
            prep: 10,
          },
          {
            name: "وربات معمول",
            description: "معمول محشي عجوة أو فستق بالسميد.",
            price: 12,
            image: "1558642452-9d2a7deb7f62",
            prep: 10,
          },
        ],
      },
    ],
  },
  {
    slug: "al-azli",
    name: "مشاوي الأصيل",
    cuisine: "مشاوي وفحم",
    description: "مشاوي على الفحم — كباب وشيش طاووق وريش غنم.",
    phone: "0592000005",
    ownerEmail: "owner.azli@wajba.ps",
    ownerPhone: "0593000005",
    ownerFirstName: "حسام",
    ownerLastName: "الأصيل",
    deliveryFee: 6,
    minimumOrder: 40,
    estimatedDeliveryTime: 35,
    city: "غزة",
    street: "حي النصر",
    cover: "1555939594-58d7cb561ad1",
    categories: [
      {
        name: "مشاوي",
        items: [
          {
            name: "كباب مشوي",
            description: "كباب لحم غنم بلدي مشوي عالفحم.",
            price: 30,
            image: "1598515214211-89d3c73ae83b",
            prep: 25,
          },
          {
            name: "شيش طاووق",
            description: "شيش طاووق متبّل بالثوم والليمون مع خضار مشوية.",
            price: 26,
            image: "1529193591184-b1d58069ecdd",
            prep: 25,
          },
          {
            name: "ريش غنم",
            description: "ريش غنم طري متبّل ومشوي عالفحم.",
            price: 35,
            image: "1600891964092-4316c288032e",
            prep: 30,
          },
          {
            name: "مشاوي مشكلة",
            description: "كباب وشيش وريش وكرشة — طبق العيلة المشترك.",
            price: 45,
            image: "1555939594-58d7cb561ad1",
            prep: 30,
          },
        ],
      },
      {
        name: "سلطات",
        items: [
          {
            name: "سلطة عربية",
            description: "خيار وطماطم وبصل بخلطة الليمون.",
            price: 8,
            image: "1540189549336-e6e99c3679fe",
            prep: 5,
          },
        ],
      },
    ],
  },
  {
    slug: "roseeta-pizza",
    name: "بيتزا روزيتا",
    cuisine: "بيتزا وسندويشات",
    description: "بيتزا إيطالية بعجينة طازة — مارغريتا وخضار وجبن.",
    phone: "0592000006",
    ownerEmail: "owner.roseeta@wajba.ps",
    ownerPhone: "0593000006",
    ownerFirstName: "دانا",
    ownerLastName: "روزيتا",
    deliveryFee: 5,
    minimumOrder: 25,
    estimatedDeliveryTime: 30,
    city: "غزة",
    street: "شارع الجلاء",
    cover: "1565299624946-b28f40a0ae38",
    categories: [
      {
        name: "بيتزا",
        items: [
          {
            name: "بيتزا مارغريتا",
            description: "صوص طماطم وموزاريلا وريحان طازج على عجينة إيطالية.",
            price: 24,
            image: "1565299624946-b28f40a0ae38",
            prep: 20,
          },
          {
            name: "بيتزا خضار",
            description: "فلفل وزيتون ومشروم وبصل على عجينة طازة.",
            price: 26,
            image: "1513104890138-7c749659a591",
            prep: 20,
          },
          {
            name: "بيتزا جبن",
            description: "أربع أنواع جبن ذايبين على عجينة هشة.",
            price: 28,
            image: "1574071318508-1cdbab80d002",
            prep: 20,
          },
        ],
      },
      {
        name: "سندويشات",
        items: [
          {
            name: "سندويش فاهيتا",
            description: "دجاج فاهيتا متبّل مع خضار مشوية وخبز طازة.",
            price: 18,
            image: "1525755662778-989d0524087e",
            prep: 15,
          },
        ],
      },
    ],
  },
  {
    slug: "ramal-falafel",
    name: "فلافل الرمال",
    cuisine: "فلافل",
    description: "فلافل مقرمشة من برة طرية من جوة — وفتة حمص على الأصول.",
    phone: "0592000007",
    ownerEmail: "owner.ramal@wajba.ps",
    ownerPhone: "0593000007",
    ownerFirstName: "محمود",
    ownerLastName: "الرملاوي",
    deliveryFee: 3,
    minimumOrder: 10,
    estimatedDeliveryTime: 15,
    city: "غزة",
    street: "حي الرمال",
    cover: "1591814468924-caf88d1232e1",
    categories: [
      {
        name: "فلافل وحمص",
        items: [
          {
            name: "فلافل عربي",
            description: "أقراص فلافل مقرمشة من برة وطرية من جوة.",
            price: 6,
            image: "1591814468924-caf88d1232e1",
            prep: 10,
          },
          {
            name: "ساندويش فلافل",
            description: "خبز طابون مع فلافل وخضار وطحينة.",
            price: 8,
            image: "1565557623262-b51c2513a641",
            prep: 10,
          },
          {
            name: "حمص بالطحينة",
            description: "حمص بلدي كريمي بزيت الزيتون.",
            price: 9,
            image: "1546833999-b9f581a1996d",
            prep: 5,
          },
          {
            name: "فته حمص",
            description: "خبز محمّص مع حمص ولبن وسمنة ساخنة.",
            price: 20,
            image: "1577805947697-89e18249d767",
            prep: 10,
          },
        ],
      },
    ],
  },
  {
    slug: "juices-al-bahr",
    name: "عصائر البحر",
    cuisine: "عصائر طازجة",
    description: "عصائر طبيعية معصورة قدامك — برتقال ومانجو وقصب وكوكتيل.",
    phone: "0592000008",
    ownerEmail: "owner.juices@wajba.ps",
    ownerPhone: "0593000008",
    ownerFirstName: "ليان",
    ownerLastName: "البحر",
    deliveryFee: 3,
    minimumOrder: 10,
    estimatedDeliveryTime: 15,
    city: "غزة",
    street: "شاطئ غزة",
    cover: "1600271886742-f049cd451bba",
    categories: [
      {
        name: "عصائر طازجة",
        items: [
          {
            name: "عصير برتقال طازج",
            description: "برتقال بلدي معصور قدامك.",
            price: 8,
            image: "1600271886742-f049cd451bba",
            prep: 5,
          },
          {
            name: "كوكتيل فواكه",
            description: "مكس موز وفراولة ومانجو بالحليب.",
            price: 12,
            image: "1507494924047-60b8ee826ca9",
            prep: 10,
          },
          {
            name: "عصير قصب",
            description: "قصب بلدي معصور قدامك.",
            price: 5,
            image: "1546173159-315724a31696",
            prep: 5,
          },
        ],
      },
    ],
  },
  {
    slug: "al-zaman-al-jamil",
    name: "حلويات الزمن الجميل",
    cuisine: "حلويات شرقية",
    description: "حلويات الزمن الجميل — كنافة وزنود الست ومعمول وكليجة.",
    phone: "0592000009",
    ownerEmail: "owner.zaman@wajba.ps",
    ownerPhone: "0593000009",
    ownerFirstName: "نور",
    ownerLastName: "الزمن",
    deliveryFee: 5,
    minimumOrder: 20,
    estimatedDeliveryTime: 25,
    city: "غزة",
    street: "وسط البلد",
    cover: "1551024506-0bccd828d307",
    categories: [
      {
        name: "حلويات شرقية",
        items: [
          {
            name: "كنافة نابلسية",
            description: "عجناط بالجبنة الحلوم والقطر والفستق.",
            price: 18,
            image: "1571115177098-24ec42ed204d",
            prep: 15,
          },
          {
            name: "زنود الست",
            description: "رقائق محشية قشطة مقلية بالقطر.",
            price: 14,
            image: "1558642452-9d2a7deb7f62",
            prep: 10,
          },
          {
            name: "وربات معمول",
            description: "معمول محشي عجوة أو فستق بالسميد.",
            price: 12,
            image: "1587314168485-3236d6710814",
            prep: 10,
          },
          {
            name: "كليجة",
            description: "كليجة عجوة بالهيل — أكلة الأعياد.",
            price: 10,
            image: "1519915028121-7d3463d20b13",
            prep: 10,
          },
        ],
      },
    ],
  },
];

// Delivered-order history: the full customer journey in backend status order.
const DELIVERY_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "DELIVERED",
];

const minutesAfter = (base, minutes) =>
  new Date(base.getTime() + minutes * 60000);

function buildDeliveredHistory(createdAt) {
  const offsets = [0, 4, 10, 25, 35, 42, 50, 60];
  return DELIVERY_STATUSES.map((status, index) => ({
    status,
    changedAt: minutesAfter(createdAt, offsets[index]),
  }));
}

// ========================
// HELPERS
// ========================

async function upsertRole(name) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertUser({ email, roleId, ...data }) {
  const hash = () => bcrypt.hash(data.password, 10);
  const fields = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    status: data.status,
    isVerified: data.isVerified,
    roleId,
  };

  // Match by email first.
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { ...fields, password: await hash() },
    });
  }

  // Email changed between runs: the same row still exists under its old email
  // (phone is unique), so re-point it to the new email instead of failing the
  // create with a phone-unique violation (P2002).
  if (data.phone) {
    const byPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (byPhone) {
      return prisma.user.update({
        where: { id: byPhone.id },
        data: { ...fields, email, password: await hash() },
      });
    }
  }

  return prisma.user.create({
    data: { ...data, email, password: await hash(), roleId },
  });
}

async function upsertAddress({ userId, ...data }) {
  return prisma.address.create({
    data: { ...data, userId },
  });
}

// ========================
// MAIN
// ========================

async function main() {
  const [adminRole, ownerRole, customerRole, driverRole] = await Promise.all(
    ["ADMIN", "OWNER", "CUSTOMER", "DRIVER"].map(upsertRole),
  );

  // Admin (kept from the original seed).
  await upsertUser({
    email: "admin@wajba.com",
    firstName: "Admin",
    lastName: "Admin",
    phone: "0590000000",
    password: "Admin$$1234",
    roleId: adminRole.id,
  });

  // Demo customer — the account used to explore the customer app.
  const customer = await upsertUser({
    email: "ahmad@wajba.com",
    firstName: "أحمد",
    lastName: "صلاح",
    phone: "0591234567",
    password: "Ahmad$$1234",
    status: "ACTIVE",
    isVerified: true,
    roleId: customerRole.id,
  });

  // Demo driver (real courier details arrive with the tracking flow).
  await upsertUser({
    email: "samer@wajba.ps",
    firstName: "سامر",
    lastName: "أبو هاشم",
    phone: "0597771234",
    password: "Samer$$1234",
    status: "ACTIVE",
    isVerified: true,
    roleId: driverRole.id,
  });

  // Clear the demo customer's old orders (cascades items/statusHistory/reviews)
  // so re-running the seed rebuilds them cleanly.
  await prisma.order.deleteMany({ where: { customerId: customer.id } });

  // Demo addresses. The customer's existing addresses are cleared first so the
  // creates below are idempotent — the account screen enforces a single default
  // per user (Address_one_default_per_user), so a plain re-create would crash on
  // a second "البيت" default and re-runs were already accumulating duplicate rows.
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  const homeAddress = await upsertAddress({
    userId: customer.id,
    label: "البيت",
    city: "غزة",
    street: "شارع الوحدة",
    building: "عمارة ٢٢",
    details: "الطابق الثالث — جنب مسجد السلام",
    isDefault: true,
  });
  const workAddress = await upsertAddress({
    userId: customer.id,
    label: "الشغل",
    city: "الوسطى",
    street: "شارع النقابة",
    details: "المكتب التجاري — الطابق الأول",
    isDefault: false,
  });

  const createdRestaurants = new Map();

  for (const fixture of RESTAURANT_FIXTURES) {
    const owner = await upsertUser({
      email: fixture.ownerEmail,
      firstName: fixture.ownerFirstName,
      lastName: fixture.ownerLastName,
      phone: fixture.ownerPhone,
      password: "Owner$$1234",
      status: "ACTIVE",
      isVerified: true,
      roleId: ownerRole.id,
    });

    // The demo owner's addresses mirror the original "restaurant address" idea
    // (each restaurant gets its own city/street row under the owner's account).
    // When the restaurant already exists, update the address currently linked to
    // it in place — this keeps addressId stable and re-runs idempotent. A plain
    // create here would accumulate a duplicate "موقع المطعم" row per re-run.
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: fixture.slug },
      select: { addressId: true },
    });
    const restaurantAddress = existingRestaurant
      ? await prisma.address.update({
          where: { id: existingRestaurant.addressId },
          data: {
            label: "موقع المطعم",
            city: fixture.city,
            street: fixture.street,
          },
        })
      : await prisma.address.create({
          data: {
            userId: owner.id,
            label: "موقع المطعم",
            city: fixture.city,
            street: fixture.street,
          },
        });

    const restaurant = await prisma.restaurant.upsert({
      where: { slug: fixture.slug },
      update: {
        name: fixture.name,
        cuisine: fixture.cuisine,
        description: fixture.description,
        phone: fixture.phone,
        email: fixture.ownerEmail,
        deliveryFee: fixture.deliveryFee,
        minimumOrder: fixture.minimumOrder,
        estimatedDeliveryTime: fixture.estimatedDeliveryTime,
        coverImageUrl: COVER(fixture.cover),
      },
      create: {
        slug: fixture.slug,
        name: fixture.name,
        cuisine: fixture.cuisine,
        description: fixture.description,
        phone: fixture.phone,
        email: fixture.ownerEmail,
        deliveryFee: fixture.deliveryFee,
        minimumOrder: fixture.minimumOrder,
        estimatedDeliveryTime: fixture.estimatedDeliveryTime,
        coverImageUrl: COVER(fixture.cover),
        ownerId: owner.id,
        addressId: restaurantAddress.id,
        status: "OPEN",
      },
    });

    // Rebuild meals/categories. Cart items pointing at these meals are removed
    // first so the FK (CartItem.mealId → onDelete Restrict) can't block the wipe;
    // past order items survive because OrderItem.mealId is SetNull.
    await prisma.cartItem.deleteMany({
      where: { meal: { restaurantId: restaurant.id } },
    });
    await prisma.meal.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.category.deleteMany({
      where: { restaurantId: restaurant.id },
    });

    for (const category of fixture.categories) {
      const created = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: category.name,
        },
      });

      for (const meal of category.items) {
        await prisma.meal.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: created.id,
            name: meal.name,
            description: meal.description,
            price: meal.price,
            imageUrl: IMG(meal.image),
            preparationTime: meal.prep,
            status: meal.available === false ? "OUT_OF_STOCK" : "AVAILABLE",
          },
        });
      }
    }

    createdRestaurants.set(fixture.slug, restaurant);
    console.log(`✅ Restaurant seeded: ${fixture.name} (${fixture.slug})`);
  }

  // ========================
  // ORDERS + REVIEWS
  // ========================

  const now = new Date();

  const orderFixtures = [
    {
      orderNumber: "ORD-SEED-0001",
      restaurantSlug: "al-azli",
      addressId: homeAddress.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: minutesAfter(now, -10),
      estimatedDeliveryAt: minutesAfter(now, 40),
      items: [
        { name: "كباب مشوي", quantity: 2, price: 30 },
        { name: "شيش طاووق", quantity: 1, price: 26 },
      ],
    },
    {
      orderNumber: "ORD-SEED-0002",
      restaurantSlug: "baladna",
      addressId: homeAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 5 * DAY),
      items: [
        { name: "مسخّن دجاج", quantity: 1, price: 38 },
        { name: "منسف", quantity: 1, price: 45 },
      ],
    },
    {
      orderNumber: "ORD-SEED-0003",
      restaurantSlug: "al-zaman-al-jamil",
      addressId: homeAddress.id,
      status: "CANCELLED",
      paymentStatus: "PENDING",
      createdAt: new Date(now.getTime() - 20 * DAY),
      items: [{ name: "كنافة نابلسية", quantity: 2, price: 18 }],
    },
    {
      orderNumber: "ORD-SEED-0004",
      restaurantSlug: "al-buhhar",
      addressId: workAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 12 * DAY),
      items: [{ name: "صيادية", quantity: 2, price: 36 }],
    },
    {
      orderNumber: "ORD-SEED-0005",
      restaurantSlug: "roseeta-pizza",
      addressId: homeAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 9 * DAY),
      items: [
        { name: "بيتزا مارغريتا", quantity: 1, price: 24 },
        { name: "بيتزا خضار", quantity: 1, price: 26 },
      ],
    },
    {
      orderNumber: "ORD-SEED-0006",
      restaurantSlug: "al-taj",
      addressId: workAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 6 * DAY),
      items: [{ name: "شاورما دجاج", quantity: 2, price: 14 }],
    },
    {
      orderNumber: "ORD-SEED-0007",
      restaurantSlug: "ramal-falafel",
      addressId: homeAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 3 * DAY),
      items: [{ name: "فلافل عربي", quantity: 4, price: 6 }],
    },
    {
      orderNumber: "ORD-SEED-0008",
      restaurantSlug: "juices-al-bahr",
      addressId: homeAddress.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      createdAt: new Date(now.getTime() - 2 * DAY),
      items: [{ name: "كوكتيل فواكه", quantity: 2, price: 12 }],
    },
  ];

  const createdOrders = [];

  for (const fixture of orderFixtures) {
    const restaurant = createdRestaurants.get(fixture.restaurantSlug);
    const subtotal = fixture.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee = Number(restaurant.deliveryFee);
    const total = subtotal + deliveryFee;

    const history =
      fixture.status === "PENDING"
        ? [{ status: "PENDING", changedAt: fixture.createdAt }]
        : fixture.status === "CANCELLED"
          ? [
              { status: "PENDING", changedAt: fixture.createdAt },
              {
                status: "CANCELLED",
                changedAt: minutesAfter(fixture.createdAt, 12),
              },
            ]
          : buildDeliveredHistory(fixture.createdAt);

    const order = await prisma.order.create({
      data: {
        orderNumber: fixture.orderNumber,
        customerId: customer.id,
        restaurantId: restaurant.id,
        addressId: fixture.addressId,
        status: fixture.status,
        paymentMethod: "CASH",
        paymentStatus: fixture.paymentStatus,
        phone: "0591234567",
        notes: null,
        subtotal,
        deliveryFee,
        total,
        estimatedDeliveryAt: fixture.estimatedDeliveryAt ?? null,
        createdAt: fixture.createdAt,
        items: {
          create: fixture.items.map((item) => ({
            mealName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
        statusHistory: { create: history },
      },
    });

    createdOrders.push({ order, restaurant });
  }

  console.log(`✅ ${createdOrders.length} orders seeded for demo customer.`);

  const REVIEWS = [
    {
      orderNumber: "ORD-SEED-0002",
      rating: 4.5,
      comment: "الأكل ممتاز بس التوصيل تأخر شوي.",
    },
    {
      orderNumber: "ORD-SEED-0004",
      rating: 5.0,
      comment: "أطيب صيادية بغزة، سعر ممتاز.",
    },
    {
      orderNumber: "ORD-SEED-0005",
      rating: 4.0,
      comment: "بيتزا لذيذة والعجينة خفيفة.",
    },
    {
      orderNumber: "ORD-SEED-0006",
      rating: 4.8,
      comment: "شاورما محترمة وسريعين.",
    },
    {
      orderNumber: "ORD-SEED-0007",
      rating: 4.6,
      comment: "فلافل طازة وطعمها بلدي.",
    },
    {
      orderNumber: "ORD-SEED-0008",
      rating: 5.0,
      comment: "عصائر طبيعية ١٠٠٪.",
    },
  ];

  for (const review of REVIEWS) {
    const target = createdOrders.find(
      (entry) => entry.order.orderNumber === review.orderNumber,
    );
    await prisma.review.upsert({
      where: { orderId: target.order.id },
      update: { rating: review.rating, comment: review.comment },
      create: {
        orderId: target.order.id,
        customerId: customer.id,
        restaurantId: target.restaurant.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }

  console.log(`✅ ${REVIEWS.length} reviews seeded.`);
  console.log("✅ Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
