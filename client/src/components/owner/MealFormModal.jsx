"use client";

import { useEffect, useState } from "react";
import OwnerModal from "./OwnerModal";
import {
  Field,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  primaryButtonClass,
  secondaryButtonClass,
} from "./OwnerFields";

// MealFormModal — create/edit a meal. `onSave` receives the server-ready
// payload (numbers converted, empty optionals as undefined).
export default function MealFormModal({
  open,
  onClose,
  onSave,
  categories,
  meal,
  busy,
}) {
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    description: "",
    imageUrl: "",
    preparationTime: "",
    isFeatured: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setForm({
      name: meal?.name ?? "",
      categoryId: meal?.categoryId ?? categories[0]?.id ?? "",
      price: meal?.price ?? "",
      description: meal?.description ?? "",
      imageUrl: meal?.imageUrl ?? "",
      preparationTime: meal?.preparationTime ?? "",
      isFeatured: meal?.isFeatured ?? false,
    });
  }, [open, meal, categories]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !form.categoryId) {
      setError("اكتب اسم الصنف واختر الفئة.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("السعر لازم يكون رقم أكبر من صفر.");
      return;
    }
    setError(null);
    onSave({
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      price,
      preparationTime: Number(form.preparationTime) || undefined,
      isFeatured: form.isFeatured,
    });
  };

  return (
    <OwnerModal
      open={open}
      onClose={onClose}
      title={meal ? "تعديل الصنف" : "إضافة صنف جديد"}
      subtitle={
        categories.length === 0
          ? "لازم تضيف فئة قبل ما تضيف أصناف"
          : undefined
      }
      footer={
        <>
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClass}>
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy || categories.length === 0}
            className={primaryButtonClass}
          >
            {busy ? "بالحفظ…" : meal ? "حفظ التعديلات" : "إضافة الصنف"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="اسم الصنف" required htmlFor="meal-name">
          <TextInput
            id="meal-name"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="مثلاً: مقلوبة دجاج"
          />
        </Field>

        <Field label="الفئة" required htmlFor="meal-category">
          <Select
            id="meal-category"
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value)}
            options={[
              ...(categories.length === 0
                ? [{ value: "", label: "ما في فئات — أضف فئة أولاً" }]
                : []),
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="السعر (شيكل)" required htmlFor="meal-price">
            <NumberInput
              id="meal-price"
              min="0.01"
              step="0.5"
              value={form.price}
              onChange={(event) => set("price", event.target.value)}
            />
          </Field>

          <Field label="وقت التحضير (دقيقة)" htmlFor="meal-prep">
            <NumberInput
              id="meal-prep"
              min="1"
              step="5"
              value={form.preparationTime}
              onChange={(event) => set("preparationTime", event.target.value)}
            />
          </Field>
        </div>

        <Field label="الوصف" htmlFor="meal-desc">
          <Textarea
            id="meal-desc"
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="شو مكونات هالصنف؟"
          />
        </Field>

        <Field label="رابط صورة الصنف" htmlFor="meal-image">
          <TextInput
            id="meal-image"
            dir="ltr"
            type="url"
            value={form.imageUrl}
            onChange={(event) => set("imageUrl", event.target.value)}
            placeholder="https://…"
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => set("isFeatured", event.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          <span className="text-[14px] font-semibold text-foreground">
            صنف مميز — اعرضه بواجهة المطعم
          </span>
        </label>

        {error ? (
          <p role="alert" className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-[13.5px] font-semibold text-error">
            {error}
          </p>
        ) : null}
      </form>
    </OwnerModal>
  );
}
