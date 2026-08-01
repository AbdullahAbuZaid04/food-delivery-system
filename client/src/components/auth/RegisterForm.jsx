"use client";

import Link from "next/link";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";

export default function RegisterForm() {
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log("إنشاء حساب (placeholder):", {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      password: data.get("password"),
      confirmPassword: data.get("confirmPassword"),
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          id="fullName"
          name="fullName"
          label="الاسم الكامل"
          placeholder="مثال: أحمد محمد"
          autoComplete="name"
          required
        />

        <AuthField
          id="email"
          name="email"
          label="البريد الإلكتروني"
          type="email"
          dir="ltr"
          inputClassName="text-left"
          placeholder="ahmad@example.com"
          autoComplete="email"
          required
        />

        <AuthField
          id="phone"
          name="phone"
          label="رقم الهاتف"
          type="tel"
          dir="ltr"
          inputClassName="text-left"
          placeholder="0590000000"
          autoComplete="tel"
          required
        />

        <PasswordField
          id="password"
          name="password"
          label="كلمة السر"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="تأكيد كلمة السر"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />

        <AuthSubmitButton>أنشئ حسابك</AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-cocoa-soft">
        عندك حساب؟{" "}
        <Link
          href="/login"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل دخولك
        </Link>
      </p>
    </>
  );
}
