import { Heart, House, ShoppingBag, UserRound } from "lucide-react";

const items = [
  { key: "home", label: "الرئيسية", icon: <House className="w-5 h-5" aria-hidden="true" /> },
  { key: "orders", label: "طلباتي", icon: <ShoppingBag className="w-5 h-5" aria-hidden="true" /> },
  { key: "favorites", label: "المفضلة", icon: <Heart className="w-5 h-5" aria-hidden="true" /> },
  { key: "account", label: "حسابي", icon: <UserRound className="w-5 h-5" aria-hidden="true" /> },
];

const ACTIVE_KEY = "home";

function BottomNav() {
  return (
    <nav
      aria-label="تنقّل الموبايل"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-clay/10 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const isActive = item.key === ACTIVE_KEY;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 h-[64px] text-[11.5px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 ${
                isActive ? "text-terra" : "text-cocoa-soft hover:text-terra"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
