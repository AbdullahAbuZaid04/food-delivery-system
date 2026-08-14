import {
  Bike,
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  CookingPot,
  PackageCheck,
  PackageOpen,
  UserCheck,
} from "lucide-react";

const STATUS_ICONS = {
  "قيد الانتظار": Clock,
  "تم القبول": CheckCheck,
  "قيد التحضير": CookingPot,
  "جاهز": PackageCheck,
  "تم تعيين سائق": UserCheck,
  "استلمه السائق": PackageOpen,
  "بالطريق": Bike,
  "تم التوصيل": CircleCheck,
  "ملغي": CircleX,
  "بانتظار تأكيد المطعم": Clock,
  "تم التأكيد": CheckCheck,
};

const STATUS_STYLES = {
  "قيد الانتظار": "bg-warning/15 text-warning",
  "تم القبول": "bg-terra/15 text-terra-dark",
  "قيد التحضير": "bg-gold/20 text-terra-dark",
  "جاهز": "bg-olive/15 text-olive-deep",
  "تم تعيين سائق": "bg-terra/15 text-terra-dark",
  "استلمه السائق": "bg-olive/15 text-olive-deep",
  "بالطريق": "bg-terra/15 text-terra-dark",
  "تم التوصيل": "bg-success/15 text-success",
  "ملغي": "bg-error/15 text-error",
  "بانتظار تأكيد المطعم": "bg-warning/15 text-warning",
  "تم التأكيد": "bg-terra/15 text-terra-dark",
};

const FALLBACK_STYLE = "bg-muted/15 text-muted";

function OrderStatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] ?? Clock;
  const style = STATUS_STYLES[status] ?? FALLBACK_STYLE;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-bold ${style}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

export default OrderStatusBadge;
