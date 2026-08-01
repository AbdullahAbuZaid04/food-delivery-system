import { Star, Clock, Bike } from "lucide-react";

/**
 * RestaurantCard — one restaurant summary card in the restaurants grid.
 * @param {Object} restaurant
 * @param {import("react").ReactNode} restaurant.icon - cuisine icon element.
 * @param {string} restaurant.tone - tailwind classes for the icon chip (bg + text).
 * @param {string} restaurant.name
 * @param {string} restaurant.cuisine
 * @param {string} restaurant.rating - Arabic-Indic rating.
 * @param {string} restaurant.time
 * @param {string} restaurant.delivery
 * @param {string[]} restaurant.dishes
 */
function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-cream-deep border border-clay/10 rounded-[24px] p-6 hover:-translate-y-1 hover:shadow-[0_24px_48px_-32px_rgba(42,36,28,0.45)] transition">
      <div className="flex items-center gap-3">
        <span
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${restaurant.tone}`}
        >
          {restaurant.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-[16.5px] text-cocoa truncate">
            {restaurant.name}
          </h3>
          <p className="text-[12.5px] text-cocoa-soft">{restaurant.cuisine}</p>
        </div>
        <div className="text-left shrink-0">
          <span className="flex items-center justify-end gap-1 text-[13px] font-bold text-cocoa">
            <Star
              className="w-3.5 h-3.5 text-gold"
              fill="currentColor"
              strokeWidth={0}
            />
            {restaurant.rating}
          </span>
          <span className="text-[11.5px] text-cocoa-soft flex items-center justify-end gap-1">
            <Clock className="w-3 h-3" />
            {restaurant.time}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {restaurant.dishes.map((dish) => (
          <span
            key={dish}
            className="bg-cream border border-clay/15 rounded-full text-[12px] text-cocoa-soft px-3 py-1"
          >
            {dish}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-dashed border-clay/20 flex items-center justify-between text-[12.5px]">
        <span className="text-cocoa-soft flex items-center gap-1.5">
          <Bike className="w-4 h-4 text-terra" />
          {restaurant.delivery}
        </span>
        <span className="text-terra-dark font-semibold hover:text-cocoa transition-colors">
          اطلب من هالمطعم
        </span>
      </div>
    </div>
  );
}

export default RestaurantCard;
