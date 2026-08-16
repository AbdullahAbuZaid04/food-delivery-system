"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Check, ChevronLeft } from "lucide-react";
import AuthField from "@components/auth/AuthField";
import PasswordField from "@components/auth/PasswordField";
import AuthSubmitButton from "@components/auth/AuthSubmitButton";
import { useAuth } from "@context/AuthContext";
import { restaurantApi } from "@lib/api";
import { restaurantFormToPayload } from "@lib/api/presenters";
import { toArabicDigits } from "@lib/format";

const PHONE_PATTERN = /^05\d{8}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const EMPTY_RESTAURANT = {
  name: "",
  description: "",
  phone: "",
  email: "",
  cuisine: "",
  logoUrl: "",
  coverImageUrl: "",
  deliveryFee: "0",
  minimumOrder: "0",
  estimatedDeliveryTime: "30",
  address: { label: "", city: "", street: "", building: "", details: "" },
};

const STEP_LABELS = ["حساب المالك", "بيانات المطعم"];

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

function StepSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 font-display font-bold text-[14.5px] text-cocoa">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function AuthTextarea({ id, label, value, onChange, placeholder }) {
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-sm font-bold text-cocoa mb-1.5">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-2xl border-2 border-clay/20 bg-white px-4 py-3 text-cocoa placeholder:text-cocoa-soft/60 transition-colors focus:border-terra focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
      />
    </div>
  );
}

// Two-step public signup for a new restaurant owner: account first, then the
// restaurant itself. Register (role OWNER) auto-logs the user in, then the
// restaurant is created for that owner and the user lands on /owner (where the
// dashboard takes over). A restaurant can be created exactly once per owner
// (server enforces "You already have a restaurant.").
export default function RestaurantSignupForm() {
  const { register, user } = useAuth();
  const router = useRouter();
  const initialRole = useRef(user?.role);

  const [step, setStep] = useState(0);
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
  const [form, setForm] = useState(EMPTY_RESTAURANT);

  // Only redirect owners that were ALREADY signed in on first render. Watching
  // `user` broadly would also fire right after register() sets the session
  // mid-submit and yank the owner away before the restaurant is created.
  useEffect(() => {
    if (initialRole.current === "OWNER") router.replace("/owner");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccountField = (key, value) =>
    setAccount((current) => ({ ...current, [key]: value }));
  const setFormField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setAddressField = (key, value) =>
    setForm((current) => ({
      ...current,
      address: { ...current.address, [key]: value },
    }));

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

  const validateRestaurant = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "اكتب اسم المطعم.";
    if (!form.cuisine.trim()) errors.cuisine = "اكتب نوع الأكل.";
    if (!PHONE_PATTERN.test(form.phone.trim()))
      errors.phone = "رقم هاتف المطعم لازم يبلّش بـ 05 ويكون ١٠ أرقام.";
    if (!form.email.trim()) errors.email = "اكتب بريد المطعم.";
    else if (!EMAIL_PATTERN.test(form.email.trim()))
      errors.email = "اكتب بريد إلكتروني صحيح.";
    if (!form.address.label.trim()) errors.addressLabel = "اكتب عنوان المكان.";
    if (!form.address.city.trim()) errors.addressCity = "اكتب المدينة.";
    if (!form.address.street.trim()) errors.addressStreet = "اكتب الشارع.";
    if (
      form.deliveryFee === "" ||
      Number.isNaN(Number(form.deliveryFee)) ||
      Number(form.deliveryFee) < 0
    )
      errors.deliveryFee = "اكتب رسوم توصيل صحيحة.";
    if (
      form.minimumOrder === "" ||
      Number.isNaN(Number(form.minimumOrder)) ||
      Number(form.minimumOrder) < 0
    )
      errors.minimumOrder = "اكتب حد أدنى صحيح.";
    if (
      form.estimatedDeliveryTime === "" ||
      Number.isNaN(Number(form.estimatedDeliveryTime)) ||
      Number(form.estimatedDeliveryTime) < 1
    )
      errors.estimatedDeliveryTime = "اكتب وقت توصيل صحيح.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (step === 0) {
      const errors = validateAccount();
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;
      setStep(1);
      return;
    }

    const errors = validateRestaurant();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const owner = await register({
        ...splitFullName(account.fullName),
        email: account.email.trim(),
        phone: account.phone.trim(),
        password: account.password,
        role: "OWNER",
      });
      await restaurantApi.createRestaurant(restaurantFormToPayload(form));
      toast.success(
        `مبروك يا ${owner.firstName}! مطعمك اتسجّل — بيجري مراجعته من الأدمن وبنوّصلك.`,
      );
      router.push("/owner");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Phone number already exists.")) {
        setStep(0);
        setFieldErrors({
          phone: "رقم الهاتف مستخدم من قبل — استخدم رقم ثاني أو سجّل دخول.",
        });
      } else if (msg.includes("Email already exists.")) {
        setStep(0);
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
      <ol aria-label="خطوات تسجيل المطعم" className="mb-6 flex items-center">
        {STEP_LABELS.map((label, index) => {
          const isCurrent = step === index;
          const isDone = index < step;
          return (
            <li
              key={label}
              className="flex flex-1 items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${
                    index <= step ? "bg-terra" : "bg-clay/20"
                  }`}
                />
              ) : (
                <span aria-hidden="true" className="flex-1" />
              )}
              <span
                className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[12.5px] font-bold ${
                  isCurrent
                    ? "bg-terra text-cream"
                    : isDone
                      ? "bg-terra/10 text-terra"
                      : "bg-clay/10 text-cocoa-soft"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{toArabicDigits(index + 1)}</span>
                )}
                {label}
              </span>
              {index < STEP_LABELS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${
                    index <= step ? "bg-terra" : "bg-clay/20"
                  }`}
                />
              ) : (
                <span aria-hidden="true" className="flex-1" />
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {step === 0 ? (
          <div className="space-y-5">
            <AuthField
              id="owner-fullName"
              label="اسمك الكامل"
              placeholder="مثال: أحمد محمد"
              autoComplete="name"
              value={account.fullName}
              onChange={(event) =>
                setAccountField("fullName", event.target.value)
              }
              error={fieldErrors.fullName}
              required
            />

            <AuthField
              id="owner-email"
              label="البريد الإلكتروني"
              type="email"
              dir="ltr"
              inputClassName="text-left"
              placeholder="ahmad@example.com"
              autoComplete="email"
              value={account.email}
              onChange={(event) => setAccountField("email", event.target.value)}
              error={fieldErrors.email}
              required
            />

            <AuthField
              id="owner-phone"
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
              id="owner-password"
              label="كلمة السر"
              placeholder="••••••••"
              autoComplete="new-password"
              value={account.password}
              onChange={(event) =>
                setAccountField("password", event.target.value)
              }
              error={fieldErrors.password}
              required
            />

            <PasswordField
              id="owner-confirmPassword"
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

            <AuthSubmitButton>
              التالي
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </AuthSubmitButton>
          </div>
        ) : (
          <div className="space-y-5">
            <StepSection title="بيانات أساسية">
              <AuthField
                id="rest-name"
                label="اسم المطعم"
                placeholder="مثلاً: مطعم بلدنا"
                value={form.name}
                onChange={(event) => setFormField("name", event.target.value)}
                error={fieldErrors.name}
                required
              />

              <AuthField
                id="rest-cuisine"
                label="نوع الأكل"
                placeholder="مثلاً: مشاوي، بيتزا"
                value={form.cuisine}
                onChange={(event) =>
                  setFormField("cuisine", event.target.value)
                }
                error={fieldErrors.cuisine}
                required
              />

              <AuthField
                id="rest-phone"
                label="رقم هاتف المطعم"
                type="tel"
                dir="ltr"
                inputClassName="text-left"
                placeholder="0590000000"
                value={form.phone}
                onChange={(event) => setFormField("phone", event.target.value)}
                error={fieldErrors.phone}
                required
              />

              <AuthField
                id="rest-email"
                label="بريد المطعم"
                type="email"
                dir="ltr"
                inputClassName="text-left"
                placeholder="owner@example.com"
                value={form.email}
                onChange={(event) => setFormField("email", event.target.value)}
                error={fieldErrors.email}
                required
              />

              <AuthTextarea
                id="rest-description"
                label="نبذة عن المطعم"
                placeholder="شو بيميّز مطعمك؟"
                value={form.description}
                onChange={(event) =>
                  setFormField("description", event.target.value)
                }
              />
            </StepSection>

            <StepSection title="الموقع">
              <AuthField
                id="rest-addr-label"
                label="عنوان المكان"
                placeholder="مثلاً: وسط المدينة"
                value={form.address.label}
                onChange={(event) =>
                  setAddressField("label", event.target.value)
                }
                error={fieldErrors.addressLabel}
                required
              />

              <AuthField
                id="rest-addr-city"
                label="المدينة"
                placeholder="غزة"
                value={form.address.city}
                onChange={(event) =>
                  setAddressField("city", event.target.value)
                }
                error={fieldErrors.addressCity}
                required
              />

              <AuthField
                id="rest-addr-street"
                label="الشارع"
                placeholder="شارع عمر المختار"
                value={form.address.street}
                onChange={(event) =>
                  setAddressField("street", event.target.value)
                }
                error={fieldErrors.addressStreet}
                required
              />

              <AuthField
                id="rest-addr-building"
                label="المبنى / علامة مميزة"
                placeholder="بجانب محطة الوقود"
                value={form.address.building}
                onChange={(event) =>
                  setAddressField("building", event.target.value)
                }
              />

              <AuthTextarea
                id="rest-addr-details"
                label="تفاصيل إضافية"
                placeholder="ملاحظات تساعد السائق يلاقي المطعم"
                value={form.address.details}
                onChange={(event) =>
                  setAddressField("details", event.target.value)
                }
              />
            </StepSection>

            <StepSection title="التوصيل والأسعار">
              <AuthField
                id="rest-delivery"
                label="رسوم التوصيل (شيكل)"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={form.deliveryFee}
                onChange={(event) =>
                  setFormField("deliveryFee", event.target.value)
                }
                error={fieldErrors.deliveryFee}
                required
              />

              <AuthField
                id="rest-min-order"
                label="الحد الأدنى للطلب (شيكل)"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.minimumOrder}
                onChange={(event) =>
                  setFormField("minimumOrder", event.target.value)
                }
                error={fieldErrors.minimumOrder}
                required
              />

              <AuthField
                id="rest-eta"
                label="وقت التوصيل التقريبي (دقيقة)"
                type="number"
                inputMode="numeric"
                min="1"
                step="5"
                value={form.estimatedDeliveryTime}
                onChange={(event) =>
                  setFormField("estimatedDeliveryTime", event.target.value)
                }
                error={fieldErrors.estimatedDeliveryTime}
                required
              />
            </StepSection>

            <StepSection title="الصور">
              <AuthField
                id="rest-logo"
                label="رابط شعار المطعم"
                type="url"
                dir="ltr"
                inputClassName="text-left"
                placeholder="https://…"
                value={form.logoUrl}
                onChange={(event) =>
                  setFormField("logoUrl", event.target.value)
                }
              />

              <AuthField
                id="rest-cover"
                label="رابط صورة الغلاف"
                type="url"
                dir="ltr"
                inputClassName="text-left"
                placeholder="https://…"
                value={form.coverImageUrl}
                onChange={(event) =>
                  setFormField("coverImageUrl", event.target.value)
                }
              />
            </StepSection>

            {error ? (
              <p
                role="alert"
                className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error leading-relaxed"
              >
                {error}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                disabled={submitting}
                className="inline-flex h-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-clay/20 bg-white px-6 font-bold text-[15px] text-cocoa transition-colors hover:bg-clay/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                رجوع
              </button>
              <div className="flex-1">
                <AuthSubmitButton pending={submitting}>
                  نوّر مطعمي
                </AuthSubmitButton>
              </div>
            </div>
          </div>
        )}
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
        بدّك تسجّل كزبون؟{" "}
        <Link
          href="/register"
          className="font-bold text-terra hover:text-terra-dark hover:underline underline-offset-4 transition-colors"
        >
          سجّل حساب عميل
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
