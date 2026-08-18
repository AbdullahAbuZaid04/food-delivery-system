"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";
import { useAuth } from "@context/AuthContext";
import { safeNextPath, splitFullName } from "@lib/constants";

export default function RegisterForm({ next }) {
  const { register } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const password = data.get("password");
    const confirmPassword = data.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("كلمتا السر مش متطابقتين.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        ...splitFullName(data.get("fullName")),
        email: data.get("email"),
        phone: data.get("phone"),
        password,
      });
      toast.success(`أهلًا ${user.firstName}! حسابك اتسجّل`);
      router.push(safeNextPath(next) || "/home");
    } catch (err) {
      setError(err.message || "تعذر إنشاء الحساب، حاول مرة تانية.");
    } finally {
      setSubmitting(false);
    }
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

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error leading-relaxed"
          >
            {error}
          </p>
        ) : null}

        <AuthSubmitButton pending={submitting}>أنشئ حسابك</AuthSubmitButton>
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
      <p className="mt-3 text-center text-sm text-cocoa-soft">
        بدّك تسجّل كصاحب مطعم؟{" "}
        <Link
          href="/register/restaurant"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل حساب صاحب مطعم
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-cocoa-soft">
        بدّك تشتغل سائق توصيل؟{" "}
        <Link
          href="/register/driver"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل حساب سائق
        </Link>
      </p>
    </>
  );
}
