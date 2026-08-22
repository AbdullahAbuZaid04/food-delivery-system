import { CircleCheck } from "lucide-react";

export default function OrderSuccessHeader({ orderNumber }) {
  return (
    <section className="animate-rise flex flex-col items-center text-center px-4">
      <span className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
        <CircleCheck
          className="w-11 h-11 text-success"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </span>
      <h1 className="mt-5 font-display font-black text-[clamp(26px,4vw,34px)] text-cocoa">
        تم تأكيد طلبك!
      </h1>
      <p className="mt-2 font-display font-bold text-[17px] text-terra">
        رقم الطلب:
        <span dir="ltr" className="ms-1.5 inline-block align-baseline">
          {orderNumber}
        </span>
      </p>
      <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-cocoa-soft">
        المطعم استلم طلبك وعم يجهزلك ياه
      </p>
    </section>
  );
}
