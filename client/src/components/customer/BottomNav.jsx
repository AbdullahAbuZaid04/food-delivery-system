import Link from "next/link";
import { Heart, House, ShoppingBag, UserRound } from "lucide-react";

const items = [
  {
    key: "home",
    label: "الرئيسية",
    href: "/home",
    icon: <House className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "orders",
    label: "طلباتي",
    href: "/orders",
    icon: <ShoppingBag className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "favorites",
    label: "المفضلة",
    href: null,
    icon: <Heart className="w-5 h-5" aria-hidden="true" />,
  },
  {
    key: "account",
    label: "حسابي",
    href: "/account",
    icon: <UserRound className="w-5 h-5" aria-hidden="true" />,
  },
];

function BottomNav({ activeKey = "home" }) {
  return (
    <nav
      aria-label="تنقّل الموبايل"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-clay/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const className = `flex flex-col items-center justify-center gap-1 h-[64px] text-[11.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 ${
            isActive ? "text-terra" : "text-cocoa-soft hover:text-terra"
          }`;
          const content = (
            <>
              {item.icon}
              {item.label}
            </>
          );

          return item.href ? (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
