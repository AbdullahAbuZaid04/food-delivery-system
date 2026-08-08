"use client";

import { useState } from "react";
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

  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const setAddress = (key, value) =>
    setForm((current) => ({
      ...current,
      address: { ...current.address, [key]: value },
    }));

  const handleSubmit = (event) => {
    event.preventDefault();
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
          <Field label="اسم المطعم" required htmlFor="rest-name">
            <TextInput
              id="rest-name"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="مثلاً: مطعم بلدنا"
              required
            />
          </Field>

          <Field
            label="نوع الأكل"
            htmlFor="rest-cuisine"
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

          <Field label="رقم الهاتف" required htmlFor="rest-phone">
            <TextInput
              id="rest-phone"
              dir="ltr"
              inputMode="tel"
              value={form.phone}
              onChange={(event) => set("phone", event.target.value)}
              placeholder="0590000000"
              required
            />
          </Field>

          <Field
            label="البريد الإلكتروني"
            htmlFor="rest-email"
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
          <Field label="عنوان المكان" required htmlFor="rest-addr-label">
            <TextInput
              id="rest-addr-label"
              value={form.address.label}
              onChange={(event) => setAddress("label", event.target.value)}
              placeholder="مثلاً: وسط المدينة"
              required
            />
          </Field>

          <Field label="المدينة" required htmlFor="rest-addr-city">
            <TextInput
              id="rest-addr-city"
              value={form.address.city}
              onChange={(event) => setAddress("city", event.target.value)}
              placeholder="غزة"
              required
            />
          </Field>

          <Field label="الشارع" required htmlFor="rest-addr-street">
            <TextInput
              id="rest-addr-street"
              value={form.address.street}
              onChange={(event) => setAddress("street", event.target.value)}
              placeholder="شارع عمر المختار"
              required
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
          <Field label="رسوم التوصيل (شيكل)" htmlFor="rest-delivery">
            <NumberInput
              id="rest-delivery"
              min="0"
              step="0.5"
              value={form.deliveryFee}
              onChange={(event) => set("deliveryFee", event.target.value)}
            />
          </Field>

          <Field label="الحد الأدنى للطلب (شيكل)" htmlFor="rest-min-order">
            <NumberInput
              id="rest-min-order"
              min="0"
              step="1"
              value={form.minimumOrder}
              onChange={(event) => set("minimumOrder", event.target.value)}
            />
          </Field>

          <Field label="وقت التوصيل التقريبي (دقيقة)" htmlFor="rest-eta">
            <NumberInput
              id="rest-eta"
              min="1"
              step="5"
              value={form.estimatedDeliveryTime}
              onChange={(event) =>
                set("estimatedDeliveryTime", event.target.value)
              }
            />
          </Field>
        </SectionCard>

        <SectionCard title="الصور">
          <Field label="رابط شعار المطعم" htmlFor="rest-logo">
            <TextInput
              id="rest-logo"
              dir="ltr"
              type="url"
              value={form.logoUrl}
              onChange={(event) => set("logoUrl", event.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="رابط صورة الغلاف" htmlFor="rest-cover">
            <TextInput
              id="rest-cover"
              dir="ltr"
              type="url"
              value={form.coverImageUrl}
              onChange={(event) => set("coverImageUrl", event.target.value)}
              placeholder="https://…"
            />
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
          {PHONE_PATTERN.test(form.phone) || !form.phone ? null : (
            <span className="text-[12.5px] font-semibold text-error">
              رقم الهاتف لازم يبلّش بـ 05 ويكون ١٠ أرقام
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
