// src/lib/mock/user.js
// بيانات "حسابي" الوهمية — مرحلة UI بس بدون أي ربط API (AGENTS.md §2/§10).
// هالملف بقلّد شكل استجابة GET /api/auth/profile حرفيًا (firstName/lastName،
// phone، profileImage، status، isVerified، role، وaddresses بكل حقولها)، حتى
// لما نربط الـ API الحقيقي نستبدل هالملف بفيتش من دون ما نعيد هيكلة الـ UI.
// قيم city بالعناوين المحفوظة بتنبني من نفس مصدر GAZA_AREAS المستخدم بفورم
// الـ Checkout حتى تبقى متوافقة مع خيارات المنطقة بالطلب نفسه.
import { GAZA_AREAS } from "@lib/mock/gazaAreas";

const areaName = (id) =>
  GAZA_AREAS.find((area) => area.id === id)?.name ?? id;

const USER_ID = "cus_0001";

export const MOCK_USER = {
  id: USER_ID,
  firstName: "أحمد",
  lastName: "صلاح",
  email: "ahmad@example.com",
  phone: "0591234567",
  profileImage: null,
  status: "ACTIVE",
  isVerified: true,
  role: "CUSTOMER",
  addresses: [
    {
      id: "addr_0001",
      userId: USER_ID,
      label: "البيت",
      city: areaName("gaza"),
      street: "شارع الوحدة",
      building: "عمارة ٢٢",
      details: "الطابق الثالث — جنب مسجد السلام",
      latitude: null,
      longitude: null,
      isDefault: true,
      createdAt: "2024-03-12T09:30:00.000Z",
      updatedAt: "2026-07-30T18:15:00.000Z",
    },
    {
      id: "addr_0002",
      userId: USER_ID,
      label: "الشغل",
      city: areaName("middle"),
      street: "شارع النقابة",
      building: null,
      details: "المكتب التجاري — الطابق الأول",
      latitude: null,
      longitude: null,
      isDefault: false,
      createdAt: "2025-01-20T11:00:00.000Z",
      updatedAt: "2025-01-20T11:00:00.000Z",
    },
  ],
  createdAt: "2024-03-12T09:30:00.000Z",
  updatedAt: "2026-07-30T18:15:00.000Z",
};
