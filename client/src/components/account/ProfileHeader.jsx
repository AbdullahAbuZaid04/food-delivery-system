// src/components/account/ProfileHeader.jsx
// بطاقة "حسابي" العلوية — أفاتار دائري كبير بنفس نمط أفاتار قائمة المستخدم
// بـ AppHeader، مع الاسم والإيميل وتاريخ العضوية (بيشتق من createdAt بالشكل
// نفسه اللي بترجعه استجابة GET /api/auth/profile). زر القلم بزاوية الأفاتار
// بيفعّل وضع تعديل inline: الاسم الأول واسم العائلة ورقم الهاتف بيصيروا
// AuthField قابلين للتعديل، و"احفظ" بيحدّث state محلي بس (بدون أي API)،
// و"إلغاء" بيرجّع القيم الأصلية.
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import AuthField from "@components/auth/AuthField";
import { toArabicDigits } from "@lib/format";

function ProfileHeader({ user }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const firstNameInputRef = useRef(null);

  const displayName = `${firstName} ${lastName}`.trim();
  const initial = firstName.trim().charAt(0) || "ز";

  // "عضو من [سنة]" بيطلع من createdAt اللي بترجعها الـ API — سنة واحدة
  // بأرقام عربية-هندية (AGENTS.md §5). لو التاريخ فاضي بنسكت عنها.
  const joinDate = new Date(user.createdAt);
  const joinedYear = Number.isNaN(joinDate.getTime())
    ? ""
    : toArabicDigits(joinDate.getFullYear());

  const startEditing = () => {
    setSaveNote("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setIsEditing(false);
    setSaveNote("");
  };

  const saveEditing = () => {
    setIsEditing(false);
    setSaveNote("تم حفظ بياناتك");
  };

  // لما بيفتح وضع التعديل، الفوكس بيمشي على أول حقل (الاسم الأول) عشان يبدأ
  // يكتب مباشرة — نفس مبدأ نقل الفوكس لفتح أي overlay بالـ AGENTS.md §6/§7.
  useEffect(() => {
    if (isEditing) firstNameInputRef.current?.focus();
  }, [isEditing]);

  // Escape بيلغي التعديل بدون حفظ — دعم كامل من الكيبورد (AGENTS.md §6).
  // تفضيليًا مضمّن مباشرة هون عشان ما يعتمد على تابع متغيّر كل render.
  useEffect(() => {
    if (!isEditing) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setPhone(user.phone);
        setIsEditing(false);
        setSaveNote("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditing, user.firstName, user.lastName, user.phone]);

  return (
    <section
      aria-label="ملفك الشخصي"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-6 sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={`صورة ${displayName}`}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-20 h-20 rounded-full bg-terra text-cream font-display font-bold text-[28px] flex items-center justify-center shadow-[0_14px_30px_-12px_rgba(184,74,38,0.55)]"
            >
              {initial}
            </span>
          )}
          {/* زر القلم على زاوية الأفاتار — الإزاحة السالبة بسيطة (-bottom-1)
              فوق أفاتار 80px وسط كارد فيه padding، فما في أي خطر فيضان على
              أقل عرض 320px (AGENTS.md §8). */}
          <button
            type="button"
            onClick={isEditing ? cancelEditing : startEditing}
            aria-label={isEditing ? "إلغاء تعديل البيانات" : "تعديل بياناتك"}
            aria-expanded={isEditing}
            className="absolute -bottom-1 -end-1 w-11 h-11 rounded-full bg-white border-2 border-clay/20 text-cocoa hover:text-terra hover:border-terra flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            {isEditing ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Pencil className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="mt-5 w-full max-w-sm space-y-4 text-start">
            <AuthField
              id="account-first-name"
              label="الاسم الأول"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              ref={firstNameInputRef}
            />

            <AuthField
              id="account-last-name"
              label="اسم العائلة"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
            />

            <AuthField
              id="account-phone"
              label="رقم الهاتف"
              type="tel"
              dir="ltr"
              inputClassName="text-left"
              placeholder="0590000000"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={saveEditing}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] px-6 shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                احفظ
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-clay/20 bg-white text-cocoa font-bold text-[14px] px-6 hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h2 className="font-display font-bold text-[20px] text-cocoa">
              {displayName}
            </h2>
            <p dir="ltr" className="mt-1 text-[13.5px] text-cocoa-soft">
              {user.email}
            </p>
            {joinedYear ? (
              <p className="mt-1 text-[13.5px] text-cocoa-soft">
                عضو من {joinedYear}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <p className="sr-only" role="status">
        {saveNote}
      </p>
    </section>
  );
}

export default ProfileHeader;
