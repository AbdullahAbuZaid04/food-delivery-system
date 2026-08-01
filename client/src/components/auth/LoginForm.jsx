"use client";

import Link from "next/link";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";

export default function LoginForm() {
  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log("تسجيل الدخول (placeholder):", {
      email: data.get("email"),
      password: data.get("password"),
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

        <PasswordField
          id="password"
          name="password"
          label="كلمة السر"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <AuthSubmitButton>سجّل دخولك</AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-cocoa-soft">
        ماعندك حساب؟{" "}
        <Link
          href="/register"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل معنا
        </Link>
      </p>
    </>
  );
}
