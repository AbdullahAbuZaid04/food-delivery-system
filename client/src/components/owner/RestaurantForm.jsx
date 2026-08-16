"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import {
  restaurantFormToPayload,
  restaurantToOwnerForm,
} from "@lib/api/presenters";
import {
  Field,
  NumberInput,
  TextInput,
  Textarea,
  primaryButtonClass,
} from "./OwnerFields";

const PHONE_PATTERN = /^05\d{8}$/;
const URL_PATTERN = /^https?:\/\/\S+\.\S+$/;

const FIELD_TO_ID = {
  name: "rest-name",
  cuisine: "rest-cuisine",
  phone: "rest-phone",
  email: "rest-email",
  logoUrl: "rest-logo",
  coverImageUrl: "rest-cover",
  deliveryFee: "rest-delivery",
  minimumOrder: "rest-min-order",
  estimatedDeliveryTime: "rest-eta",
  "address.label": "rest-addr-label",
  "address.city": "rest-addr-city",
  "address.street": "rest-addr-street",
};

// Client-side mirror of the server's create/update schemas — the form uses
// `noValidate`, so required/malformed fields get inline Arabic errors instead
// of the browser's (English) native bubbles.
function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "اسم المطعم مطلوب";
  } else if (form.name.trim().length < 2) {
    errors.name = "الاسم لازم يكون حرفين على الأقل";
  }

  if (!form.cuisine.trim()) {
    errors.cuisine = "نوع الأكل مطلوب";
  }

  if (!form.phone.trim()) {
    errors.phone = "رقم الهاتف مطلوب";
  } else if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "رقم الهاتف لازم يبلّش بـ 05 ويكون 10 أرقام";
  }

  if (!form.email.trim()) {
    errors.email = "البريد الإلكتروني مطلوب";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "بريد إلكتروني غير صحيح";
  }

  if (form.logoUrl.trim() && !URL_PATTERN.test(form.logoUrl)) {
    errors.logoUrl = "الرابط لازم يبلّش بـ https://";
  }
  if (form.coverImageUrl.trim() && !URL_PATTERN.test(form.coverImageUrl)) {
    errors.coverImageUrl = "الرابط لازم يبلّش بـ https://";
  }

  const deliveryFee = Number(form.deliveryFee);
  const minimumOrder = Number(form.minimumOrder);
  const eta = Number(form.estimatedDeliveryTime);

  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    errors.deliveryFee = "رسوم التوصيل لازم تكون 0 أو أكثر";
  }
  if (!Number.isFinite(minimumOrder) || minimumOrder < 0) {
    errors.minimumOrder = "الحد الأدنى للطلب لازم يكون 0 أو أكثر";
  }
  if (!Number.isFinite(eta) || eta < 1) {
    errors.estimatedDeliveryTime = "الوقت التقريبي لازم يكون دقيقة أو أكثر";
  }

  if (!form.address.label.trim()) {
    errors["address.label"] = "عنوان المكان مطلوب";
  }
  if (!form.address.city.trim()) {
    errors["address.city"] = "المدينة مطلوبة";
  }
  if (!form.address.street.trim()) {
    errors["address.street"] = "الشارع مطلوب";
  }

  return errors;
}

// Live preview of a logo/cover URL. `unoptimized` so any valid https host
// renders (next/image only allows whitelisted domains for optimization); the
// placeholder shows when the field is empty or the URL can't load. Keyed by
// `url` from the parent so a failed load resets as soon as the URL changes.
function UrlPreview({ url, alt }) {
  const [failed, setFailed] = useState(false);
  const usable = url && URL_PATTERN.test(url.trim());

  return (
    <div className="relative mt-2 h-24 w-full overflow-hidden rounded-xl border border-border bg-background">
      {usable && !failed ? (
        <Image
          src={url.trim()}
          alt={alt}
          unoptimized
          fill
          sizes="(max-width: 640px) 100vw, 300px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
          <span className="text-[11px] font-semibold">بدون صورة</span>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="mb-4 font-display text-[16px] font-bold text-foreground">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// RestaurantForm — shared create/edit form for the owner's restaurant. Both the
// setup screen (empty initial) and the settings screen (prefilled restaurant)
// render this; `onSave` receives the server-ready payload built from state.
export default function RestaurantForm({
  initial,
  onSave,
  submitting,
  error,
  submitLabel,
  title,
  subtitle,
  lockedFields = [],
}) {
  const [form, setForm] = useState(() => restaurantToOwnerForm(initial));
  const [fieldErrors, setFieldErrors] = useState({});

  const clearError = (key) =>
    setFieldErrors((errors) => {
      if (!errors[key]) return errors;
      const next = { ...errors };
      delete next[key];
      return next;
    });

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    clearError(key);
  };
  const setAddress = (key, value) => {
    setForm((current) => ({
      ...current,
      address: { ...current.address, [key]: value },
    }));
    clearError(`address.${key}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const id = FIELD_TO_ID[Object.keys(errors)[0]];
      if (id) document.getElementById(id)?.focus();
      return;
    }
    setFieldErrors({});
    onSave(restaurantFormToPayload(form));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-[24px] font-black text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <SectionCard title="بيانات أساسية">
          <Field
            label="اسم المطعم"
            required
            htmlFor="rest-name"
            error={fieldErrors.name}
          >
            <TextInput
              id="rest-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="مثلاً: مطعم بلدنا"
              required
              aria-invalid={fieldErrors.name ? true : undefined}
            />
          </Field>

          <Field
            label="نوع الأكل"
            htmlFor="rest-cuisine"
            error={fieldErrors.cuisine}
            hint={
              lockedFields.includes("cuisine")
                ? "نوع الأكل ثابت بعد تأسيس المطعم — ما بيصير يتبدّل"
                : "مثلاً: مشاوي، بيتزا، حلويات"
            }
          >
            <TextInput
              id="rest-cuisine"
              value={form.cuisine}
              onChange={(event) => set("cuisine", event.target.value)}
              placeholder="مشاوي"
              disabled={lockedFields.includes("cuisine")}
              className={
                lockedFields.includes("cuisine")
                  ? "disabled:cursor-not-allowed disabled:opacity-60"
                  : ""
              }
            />
          </Field>

          <Field
            label="رقم الهاتف"
            required
            htmlFor="rest-phone"
            error={fieldErrors.phone}
          >
            <TextInput
              id="rest-phone"
              dir="ltr"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="0590000000"
              required
              aria-invalid={fieldErrors.phone ? true : undefined}
            />
          </Field>

          <Field
            label="البريد الإلكتروني"
            htmlFor="rest-email"
            error={fieldErrors.email}
            hint={
              lockedFields.includes("email")
                ? "بريد المطعم للتواصل — ثابت وما بيصير يتبدّل"
                : undefined
            }
          >
            <TextInput
              id="rest-email"
              dir="ltr"
              type="email"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
              placeholder="owner@example.com"
              disabled={lockedFields.includes("email")}
              className={
                lockedFields.includes("email")
                  ? "disabled:cursor-not-allowed disabled:opacity-60"
                  : ""
              }
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="نبذة عن المطعم" htmlFor="rest-desc">
              <Textarea
                id="rest-desc"
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="شو بيميّز مطعمك؟"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="الموقع">
          <Field
            label="عنوان المكان"
            required
            htmlFor="rest-addr-label"
            error={fieldErrors["address.label"]}
          >
            <TextInput
              id="rest-addr-label"
              value={form.address.label}
              onChange={(event) => setAddress("label", event.target.value)}
              placeholder="مثلاً: وسط المدينة"
              required
              aria-invalid={fieldErrors["address.label"] ? true : undefined}
            />
          </Field>

          <Field
            label="المدينة"
            required
            htmlFor="rest-addr-city"
            error={fieldErrors["address.city"]}
          >
            <TextInput
              id="rest-addr-city"
              value={form.address.city}
              onChange={(event) => setAddress("city", event.target.value)}
              placeholder="غزة"
              required
              aria-invalid={fieldErrors["address.city"] ? true : undefined}
            />
          </Field>

          <Field
            label="الشارع"
            required
            htmlFor="rest-addr-street"
            error={fieldErrors["address.street"]}
          >
            <TextInput
              id="rest-addr-street"
              value={form.address.street}
              onChange={(event) => setAddress("street", event.target.value)}
              placeholder="شارع عمر المختار"
              required
              aria-invalid={fieldErrors["address.street"] ? true : undefined}
            />
          </Field>

          <Field label="المبنى / علامة مميزة" htmlFor="rest-addr-building">
            <TextInput
              id="rest-addr-building"
              value={form.address.building}
              onChange={(event) => setAddress("building", event.target.value)}
              placeholder="بجانب محطة الوقود"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="تفاصيل إضافية" htmlFor="rest-addr-details">
              <Textarea
                id="rest-addr-details"
                value={form.address.details}
                onChange={(event) => setAddress("details", event.target.value)}
                placeholder="ملاحظات تساعد السائق يلاقي المطعم"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="التوصيل والأسعار">
          <Field
            label="رسوم التوصيل (شيكل)"
            htmlFor="rest-delivery"
            error={fieldErrors.deliveryFee}
          >
            <NumberInput
              id="rest-delivery"
              min="0"
              step="0.5"
              value={form.deliveryFee}
              onChange={(event) => set("deliveryFee", event.target.value)}
              aria-invalid={fieldErrors.deliveryFee ? true : undefined}
            />
          </Field>

          <Field
            label="الحد الأدنى للطلب (شيكل)"
            htmlFor="rest-min-order"
            error={fieldErrors.minimumOrder}
          >
            <NumberInput
              id="rest-min-order"
              min="0"
              step="1"
              value={form.minimumOrder}
              onChange={(event) => set("minimumOrder", event.target.value)}
              aria-invalid={fieldErrors.minimumOrder ? true : undefined}
            />
          </Field>

          <Field
            label="وقت التوصيل التقريبي (دقيقة)"
            htmlFor="rest-eta"
            error={fieldErrors.estimatedDeliveryTime}
          >
            <NumberInput
              id="rest-eta"
              min="1"
              step="5"
              value={form.estimatedDeliveryTime}
              onChange={(event) =>
                set("estimatedDeliveryTime", event.target.value)
              }
              aria-invalid={fieldErrors.estimatedDeliveryTime ? true : undefined}
            />
          </Field>
        </SectionCard>

        <SectionCard title="الصور">
          <Field
            label="رابط شعار المطعم"
            htmlFor="rest-logo"
            error={fieldErrors.logoUrl}
          >
            <TextInput
              id="rest-logo"
              dir="ltr"
              type="url"
              value={form.logoUrl}
              onChange={(event) => set("logoUrl", event.target.value)}
              placeholder="https://…"
              aria-invalid={fieldErrors.logoUrl ? true : undefined}
            />
            <UrlPreview key={form.logoUrl} url={form.logoUrl} alt="شعار المطعم" />
          </Field>

          <Field
            label="رابط صورة الغلاف"
            htmlFor="rest-cover"
            error={fieldErrors.coverImageUrl}
          >
            <TextInput
              id="rest-cover"
              dir="ltr"
              type="url"
              value={form.coverImageUrl}
              onChange={(event) => set("coverImageUrl", event.target.value)}
              placeholder="https://…"
              aria-invalid={fieldErrors.coverImageUrl ? true : undefined}
            />
            <UrlPreview key={form.coverImageUrl} url={form.coverImageUrl} alt="صورة غلاف المطعم" />
          </Field>
        </SectionCard>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={primaryButtonClass}
          >
            {submitting ? "بالحفظ…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
