import RestaurantCard from "@components/ui/RestaurantCard";
import { toArabicDigits } from "@lib/format";

function RestaurantGrid({ restaurants }) {
  return (
    <section aria-label="المطاعم المتاحة" className="mt-8 md:mt-10">
      <h2 className="sr-only">المطاعم المتاحة</h2>
      <p className="sr-only" role="status">
        {restaurants.length === 1
          ? "لاقينا مطعم واحد"
          : `لاقينا ${toArabicDigits(restaurants.length)} مطاعم`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  );
}

export default RestaurantGrid;
