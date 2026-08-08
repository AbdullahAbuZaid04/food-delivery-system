"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CircleCheck,
  Loader2,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import AuthField from "@components/auth/AuthField";

export default function SavedAddressPicker({
  addresses,
  selectedId,
  onSelect,
  phone,
  onPhoneChange,
  onAddAddress,
  isAdding,
  autoOpenForm = false,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoOpenForm) setIsFormOpen(true);
  }, [autoOpenForm]);
  const [label, setLabel] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [details, setDetails] = useState("");

  const canSubmitAddress =
    label.trim() !== "" && city.trim() !== "" && street.trim() !== "";

  const resetForm = () => {
    setLabel("");
    setCity("");
    setStreet("");
    setBuilding("");
    setDetails("");
    setIsFormOpen(false);
  };

  const handleSubmitAddress = async (event) => {
    event.preventDefault();
    if (!canSubmitAddress || isAdding) return;
    await onAddAddress({
      label: label.trim(),
      city: city.trim(),
      street: street.trim(),
      building: building.trim(),
      details: details.trim(),
    });
    resetForm();
  };

  return (
    <section
      aria-labelledby="delivery-address-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="delivery-address-title"
        className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
      >
        <MapPin className="w-5 h-5 text-terra shrink-0" aria-hidden="true" />
        عنوان التوصيل
      </h2>

      {addresses.length > 0 ? (
        <div
          role="radiogroup"
          aria-label="اختار عنوان التوصيل"
          className="mt-5 grid gap-3"
        >
          {addresses.map((address) => {
            const isSelected = address.id === selectedId;
            const extraLine = [address.building, address.details]
              .filter(Boolean)
              .join(" — ");
            return (
              <label
                key={address.id}
                className={`relative flex items-start gap-3 rounded-[20px] border-2 p-4 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-terra/40 ${
                  isSelected
                    ? "border-terra bg-white ring-1 ring-terra/30"
                    : "border-clay/20 bg-white hover:border-terra/40"
                }`}
              >
                <input
                  type="radio"
                  name="checkout-address"
                  value={address.id}
                  checked={isSelected}
                  onChange={() => onSelect(address.id)}
                  className="sr-only"
                />
                <span
                  className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-terra/12 text-terra"
                      : "bg-clay/10 text-cocoa-soft"
                  }`}
                >
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-cocoa">
                      {address.label}
                    </span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-terra/12 text-terra px-3 py-1 text-[11.5px] font-bold">
                        افتراضي
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-cocoa-soft leading-relaxed">
                    {address.city} · {address.street}
                  </span>
                  {extraLine ? (
                    <span className="mt-0.5 block text-[12.5px] text-cocoa-soft/80 leading-relaxed">
                      {extraLine}
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <CircleCheck
                    className="w-6 h-6 text-terra shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="w-6 h-6 shrink-0 rounded-full border-2 border-clay/30"
                    aria-hidden="true"
                  />
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-[13.5px] text-cocoa-soft leading-relaxed">
          لسا ما عندك عناوين محفوظة — ضيف عنوانك الأول تحت حتى تقدر تطلب.
        </p>
      )}

      {isFormOpen ? (
        <form
          onSubmit={handleSubmitAddress}
          noValidate
          className="mt-5 rounded-[20px] border-2 border-dashed border-clay/25 bg-white/60 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14.5px] font-bold text-cocoa">أضف عنوان جديد</p>
            <button
              type="button"
              onClick={resetForm}
              aria-label="أغلق فورم إضافة العنوان"
              className="w-11 h-11 flex items-center justify-center rounded-full text-cocoa-soft hover:text-terra hover:bg-terra/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <AuthField
            id="new-address-label"
            label="اسم العنوان"
            placeholder="مثال: البيت"
            autoComplete="off"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              id="new-address-city"
              label="المحافظة / المنطقة"
              placeholder="مثال: غزة"
              autoComplete="address-level1"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
            <AuthField
              id="new-address-street"
              label="الشارع"
              placeholder="مثال: شارع الوحدة"
              autoComplete="street-address"
              value={street}
              onChange={(event) => setStreet(event.target.value)}
            />
          </div>

          <AuthField
            id="new-address-building"
            label="العمارة / الدور"
            hint="اختياري"
            placeholder="مثال: عمارة ٢٢، طابق ٣"
            autoComplete="off"
            value={building}
            onChange={(event) => setBuilding(event.target.value)}
          />

          <AuthField
            id="new-address-details"
            label="تفاصيل إضافية"
            hint="اختياري"
            placeholder="مثال: جنب مسجد السلام"
            autoComplete="off"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />

          <button
            type="submit"
            disabled={!canSubmitAddress || isAdding}
            aria-disabled={!canSubmitAddress || isAdding}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <Loader2
                className="w-5 h-5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Plus className="w-5 h-5" aria-hidden="true" />
            )}
            احفظ العنوان
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-clay/25 bg-white/60 text-cocoa font-bold text-[14px] hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          أضف عنوان جديد
        </button>
      )}

      <div className="mt-6 pt-5 border-t border-dashed border-clay/20">
        <AuthField
          id="checkout-phone"
          name="phone"
          label="رقم الهاتف للتواصل"
          hint="مطلوب — المندوب بيعتمد هالرقم لو احتاج يتواصل معك"
          type="tel"
          dir="ltr"
          inputClassName="text-left"
          placeholder="0590000000"
          autoComplete="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
        />
        <p className="mt-2 text-[12.5px] text-cocoa-soft/80">
          بتقدر تدير عناوينك المحفوظة من{" "}
          <Link
            href="/account"
            className="text-terra font-semibold underline underline-offset-2 hover:text-terra-dark transition-colors"
          >
            صفحة حسابي
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
