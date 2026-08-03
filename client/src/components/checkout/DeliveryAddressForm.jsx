import { ChevronDown, MapPin } from "lucide-react";
import AuthField from "@components/auth/AuthField";
import { GAZA_AREAS } from "@lib/mock/gazaAreas";

export default function DeliveryAddressForm({
  area,
  onAreaChange,
  neighborhood,
  onNeighborhoodChange,
  landmark,
  onLandmarkChange,
  phone,
  onPhoneChange,
}) {
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

      <div className="mt-5 space-y-5">
        <div>
          <label htmlFor="checkout-area" className="block text-sm font-bold text-cocoa mb-1.5">
            المنطقة <span className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              id="checkout-area"
              name="area"
              required
              value={area}
              onChange={(event) => onAreaChange(event.target.value)}
              className="w-full appearance-none rounded-2xl border-2 border-clay/20 bg-white ps-4 pe-10 py-3 text-cocoa transition-colors focus:border-terra focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
            >
              <option value="" disabled>
                اختار منطقتك
              </option>
              {GAZA_AREAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-5 h-5 text-cocoa-soft absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        <AuthField
          id="checkout-neighborhood"
          name="neighborhood"
          label="الحي / الشارع"
          placeholder="مثال: حي الرمال، شارع الوحدة"
          autoComplete="street-address"
          value={neighborhood}
          onChange={(event) => onNeighborhoodChange(event.target.value)}
        />

        <AuthField
          id="checkout-landmark"
          name="landmark"
          label="أقرب معلم"
          hint="اختياري — بيساعد المندوب يوصلك أسرع"
          placeholder="مثال: جنب مسجد السلام"
          autoComplete="off"
          value={landmark}
          onChange={(event) => onLandmarkChange(event.target.value)}
        />

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
      </div>
    </section>
  );
}
