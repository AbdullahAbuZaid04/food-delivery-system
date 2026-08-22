"use client";

import { useState } from "react";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthField from "@components/auth/AuthField";
import { addAddress, deleteAddress, updateAddress } from "@lib/api/auth";

function SavedAddressesList({ addresses }) {
  const [items, setItems] = useState(addresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    label: "",
    city: "",
    street: "",
    building: "",
    details: "",
    isDefault: false,
  });

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openForm = () => {
    setFormError("");
    setForm({
      label: "",
      city: "",
      street: "",
      building: "",
      details: "",
      isDefault: false,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setFormError("");
    setIsFormOpen(false);
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!form.label.trim() || !form.city.trim() || !form.street.trim()) {
      setFormError("مطلوب اسم العنوان والمنطقة والشارع على الأقل");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      const created = await addAddress({
        label: form.label.trim(),
        city: form.city.trim(),
        street: form.street.trim(),
        building: form.building.trim() || undefined,
        details: form.details.trim() || undefined,
        isDefault: form.isDefault,
      });
      setItems((current) =>
        created.isDefault
          ? [...current.map((address) => ({ ...address, isDefault: false })), created]
          : [...current, created],
      );
      setIsFormOpen(false);
      toast.success("تمت إضافة العنوان بنجاح");
    } catch (err) {
      setFormError(err?.message || "صارت مشكلة في إضافة العنوان");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      setItems((current) => current.filter((address) => address.id !== id));
      toast.success("تم حذف العنوان");
    } catch (err) {
      toast.error(err?.message || "صارت مشكلة في حذف العنوان");
    }
  };

  const handleMakeDefault = async (id) => {
    if (isUpdatingId) return;
    setIsUpdatingId(id);
    try {
      await updateAddress(id, { isDefault: true });
      setItems((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === id,
        })),
      );
      toast.success("صار هاد عنوانك الافتراضي");
    } catch (err) {
      toast.error(err?.message || "صارت مشكلة في تعديل العنوان");
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <section
      aria-labelledby="saved-addresses-title"
      className="rounded-[24px] border border-clay/10 bg-cream-deep p-5 sm:p-6"
    >
      <h2
        id="saved-addresses-title"
        className="flex items-center gap-2 font-display font-bold text-[17px] text-cocoa"
      >
        <MapPin className="w-5 h-5 text-terra shrink-0" aria-hidden="true" />
        العناوين المحفوظة
      </h2>

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-clay/10">
          {items.map((address) => {
            const extraLine = [address.building, address.details]
              .filter(Boolean)
              .join(" — ");
            return (
              <li
                key={address.id}
                className="flex items-center gap-3 py-3.5 first:pt-1 last:pb-1"
              >
                <span className="w-11 h-11 shrink-0 rounded-full bg-terra/10 text-terra flex items-center justify-center">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[15px] font-bold text-cocoa">
                      {address.label}
                    </p>
                    {address.isDefault ? (
                      <span className="shrink-0 rounded-full bg-terra/12 text-terra px-3 py-1 text-[11.5px] font-bold">
                        افتراضي
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[13px] text-cocoa-soft leading-relaxed">
                    {address.city} · {address.street}
                  </p>
                  {extraLine ? (
                    <p className="mt-0.5 text-[12.5px] text-cocoa-soft/80 leading-relaxed">
                      {extraLine}
                    </p>
                  ) : null}
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleMakeDefault(address.id)}
                      disabled={isUpdatingId !== null}
                      aria-disabled={isUpdatingId !== null}
                      className="mt-2 inline-flex items-center gap-1.5 h-11 rounded-full pr-1 text-[13px] font-bold text-terra hover:text-terra-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
                    >
                      {isUpdatingId === address.id ? (
                        <Loader2
                          className="w-4 h-4 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <Star className="w-4 h-4" aria-hidden="true" />
                      )}
                      جعله الافتراضي
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  aria-label={`احذف عنوان ${address.label}`}
                  className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-cocoa-soft hover:text-error hover:bg-error/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
                >
                  <Trash2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-[13.5px] text-cocoa-soft leading-relaxed">
          لسا ما أضفت عناوين محفوظة — أضف أول عنوان عشان يوصل طلبك للمكان الصحيح.
        </p>
      )}

      <div className="mt-5 pt-5 border-t border-dashed border-clay/20">
        {isFormOpen ? (
          <form onSubmit={handleAdd} className="space-y-4">
            <AuthField
              id="address-label"
              label="اسم العنوان"
              placeholder="مثلاً: البيت"
              autoComplete="off"
              value={form.label}
              onChange={(event) => setField("label", event.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                id="address-city"
                label="المنطقة"
                placeholder="مثلاً: غزة — الشمال"
                autoComplete="off"
                value={form.city}
                onChange={(event) => setField("city", event.target.value)}
              />
              <AuthField
                id="address-street"
                label="الشارع"
                placeholder="مثلاً: شارع الوحدة"
                autoComplete="off"
                value={form.street}
                onChange={(event) => setField("street", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                id="address-building"
                label="المبنى (اختياري)"
                placeholder="مثلاً: عمارة ٢٢"
                autoComplete="off"
                value={form.building}
                onChange={(event) => setField("building", event.target.value)}
              />
              <AuthField
                id="address-details"
                label="تفاصيل (اختياري)"
                placeholder="مثلاً: الطابق الثالث"
                autoComplete="off"
                value={form.details}
                onChange={(event) => setField("details", event.target.value)}
              />
            </div>

            <label className="flex items-center gap-2.5 text-[14px] font-bold text-cocoa cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setField("isDefault", event.target.checked)}
                className="w-5 h-5 accent-terra rounded"
              />
              خلّيه عنواني الافتراضي
            </label>

            {formError ? (
              <p className="text-error text-[13px]" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-full bg-terra text-cream font-bold text-[14px] px-6 shadow-[0_10px_22px_-10px_rgba(184,74,38,0.9)] hover:bg-terra-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                {isSubmitting ? "عم نضيف..." : "حفظ العنوان"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-clay/20 bg-white text-cocoa font-bold text-[14px] px-6 hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={openForm}
            aria-expanded={false}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-clay/25 bg-white/60 text-cocoa font-bold text-[14px] hover:border-terra hover:text-terra transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            أضف عنوان جديد
          </button>
        )}
      </div>
    </section>
  );
}

export default SavedAddressesList;
