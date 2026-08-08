import { LayoutDashboard, Store, Users } from "lucide-react";

export const adminNavLinks = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/restaurants", label: "المطاعم", icon: Store },
];

// "/admin" matches exactly; the rest match their own subtree.
export function isAdminRouteActive(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
