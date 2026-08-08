"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";
import { useAuth } from "@context/AuthContext";

function safeNextPath(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : null;
}

export default function LoginForm({ next }) {
  const { login } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData(event.currentTarget);
      const user = await login(data.get("email"), data.get("password"));
      toast.success(`أهلًا ${user.firstName}!`);
      if (user.role === "OWNER") {
        router.push("/owner");
        return;
      }
      if (user.role === "DRIVER") {
        router.push("/driver");
        return;
      }
      if (user.role === "ADMIN") {
        router.push("/admin");
        return;
      }
      router.push(safeNextPath(next) || "/home");
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول، حاول مرة تانية.");
    } finally {
      setSubmitting(false);
    }
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

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error leading-relaxed"
          >
            {error}
          </p>
        ) : null}

        <AuthSubmitButton pending={submitting}>سجّل دخولك</AuthSubmitButton>
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
