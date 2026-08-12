"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";
import { useAuth } from "@context/AuthContext";

const PHONE_PATTERN = /^05\d{8}$/;

function splitFullName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

// Public one-step signup for a delivery driver: just the account (role DRIVER).
// Register auto-logs the user in, then the user lands on /driver where the
// dashboard takes over. Drivers don't carry a business entity like a
// restaurant, so there is no second step.
export default function DriverSignupForm() {
  const { register, user } = useAuth();
  const router = useRouter();
  const initialRole = useRef(user?.role);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [account, setAccount] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Only redirect drivers that were ALREADY signed in on first render. Watching
  // `user` broadly would also fire right after register() sets the session
  // mid-submit and yank the driver away before the redirect to /driver.
  useEffect(() => {
    if (initialRole.current === "DRIVER") router.replace("/driver");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccountField = (key, value) =>
    setAccount((current) => ({ ...current, [key]: value }));

  const validateAccount = () => {
    const errors = {};
    if (!account.fullName.trim()) errors.fullName = "اكتب اسمك الكامل.";
    if (!account.email.trim()) errors.email = "اكتب بريدك الإلكتروني.";
    if (!PHONE_PATTERN.test(account.phone.trim()))
      errors.phone = "رقم الهاتف لازم يبلّش بـ 05 ويكون ١٠ أرقام.";
    if (account.password.length < 8)
      errors.password = "كلمة السر لازم تكون ٨ أحرف على الأقل.";
    if (account.confirmPassword !== account.password)
      errors.confirmPassword = "كلمتا السر مش متطابقتين.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const errors = validateAccount();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const driver = await register({
        ...splitFullName(account.fullName),
        email: account.email.trim(),
        phone: account.phone.trim(),
        password: account.password,
        role: "DRIVER",
      });
      toast.success(
        `أهلًا يا ${driver.firstName}! طلب انضمامك انبعت — الأدمن رح يراجعه ويبينلك أول ما يوافق.`,
      );
      router.push("/driver");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Phone number already exists.")) {
        setFieldErrors({
          phone: "رقم الهاتف مستخدم من قبل — استخدم رقم ثاني أو سجّل دخول.",
        });
      } else if (msg.includes("Email already exists.")) {
        setFieldErrors({
          email: "البريد مستخدم من قبل — استخدم بريد ثاني أو سجّل دخول.",
        });
      } else {
        setError(msg || "صارت مشكلة بالتسجيل، حاول مرة تانية.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          id="driver-fullName"
          label="اسمك الكامل"
          placeholder="مثال: خالد حسن"
          autoComplete="name"
          value={account.fullName}
          onChange={(event) =>
            setAccountField("fullName", event.target.value)
          }
          error={fieldErrors.fullName}
          required
        />

        <AuthField
          id="driver-email"
          label="البريد الإلكتروني"
          type="email"
          dir="ltr"
          inputClassName="text-left"
          placeholder="khaled@example.com"
          autoComplete="email"
          value={account.email}
          onChange={(event) => setAccountField("email", event.target.value)}
          error={fieldErrors.email}
          required
        />

        <AuthField
          id="driver-phone"
          label="رقم الهاتف"
          type="tel"
          dir="ltr"
          inputClassName="text-left"
          placeholder="0590000000"
          autoComplete="tel"
          value={account.phone}
          onChange={(event) => setAccountField("phone", event.target.value)}
          error={fieldErrors.phone}
          required
        />

        <PasswordField
          id="driver-password"
          label="كلمة السر"
          placeholder="••••••••"
          autoComplete="new-password"
          value={account.password}
          onChange={(event) => setAccountField("password", event.target.value)}
          error={fieldErrors.password}
          required
        />

        <PasswordField
          id="driver-confirmPassword"
          label="تأكيد كلمة السر"
          placeholder="••••••••"
          autoComplete="new-password"
          value={account.confirmPassword}
          onChange={(event) =>
            setAccountField("confirmPassword", event.target.value)
          }
          error={fieldErrors.confirmPassword}
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

        <AuthSubmitButton pending={submitting}>
          انضم لفريق التوصيل
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-cocoa-soft">
        بدّك تسجّل كزبون؟{" "}
        <Link
          href="/register"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل حساب عميل
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-cocoa-soft">
        صاحب مطعم؟{" "}
        <Link
          href="/register/restaurant"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل مطعمك وابدأ بيع
        </Link>
      </p>
    </>
  );
}
