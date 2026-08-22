"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import AuthField from "@components/auth/AuthField";
import { toArabicDigits } from "@lib/format";

function ProfileHeader({ user, onSaved }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");
  const [saveError, setSaveError] = useState("");
  const firstNameInputRef = useRef(null);

  const displayName = `${firstName} ${lastName}`.trim();
  const initial = firstName.trim().charAt(0) || "ز";

  const joinDate = new Date(user.createdAt);
  const joinedYear = Number.isNaN(joinDate.getTime())
    ? ""
    : toArabicDigits(joinDate.getFullYear());

  const startEditing = () => {
    setSaveNote("");
    setSaveError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setIsEditing(false);
    setSaveNote("");
    setSaveError("");
  };

  const saveEditing = async () => {
    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    const nextPhone = phone.trim();

    if (
      nextFirstName === user.firstName &&
      nextLastName === user.lastName &&
      nextPhone === user.phone
    ) {
      setIsEditing(false);
      setSaveNote("");
      setSaveError("");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      await onSaved({
        firstName: nextFirstName,
        lastName: nextLastName,
        phone: nextPhone,
      });
      setIsEditing(false);
      setSaveNote("تم حفظ بياناتك");
    } catch (err) {
      setSaveError(err?.message || "صارت مشكلة في حفظ بياناتك");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isEditing) firstNameInputRef.current?.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setPhone(user.phone);
        setIsEditing(false);
        setSaveNote("");
        setSaveError("");
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

            {saveError ? (
              <p className="text-error text-[13px]" role="alert">
                {saveError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={saveEditing}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] px-6 shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                {isSaving ? (
                  <Loader2
                    className="w-4 h-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <Check className="w-4 h-4" aria-hidden="true" />
                )}
                {isSaving ? "عم نحفظ..." : "احفظ"}
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
            {user.phone ? (
              <p dir="ltr" className="mt-1 text-[13.5px] text-cocoa-soft">
                {user.phone}
              </p>
            ) : null}
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
