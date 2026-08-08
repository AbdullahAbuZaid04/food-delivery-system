import { LayoutDashboard, ReceiptText, Settings, Star, UtensilsCrossed } from "lucide-react";

export const ownerNavLinks = [
  { href: "/owner", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/owner/orders", label: "الطلبات", icon: ReceiptText },
  { href: "/owner/menu", label: "المنيو", icon: UtensilsCrossed },
  { href: "/owner/reviews", label: "التقييمات", icon: Star },
  { href: "/owner/settings", label: "إعدادات المطعم", icon: Settings },
];

// "/owner" matches exactly; the rest match their own subtree.
export function isOwnerRouteActive(pathname, href) {
  if (href === "/owner") return pathname === "/owner";
  return pathname === href || pathname.startsWith(`${href}/`);
}
