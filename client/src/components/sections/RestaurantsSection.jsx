import Ornament from "@components/ui/Ornament";
import RestaurantCard from "@components/ui/RestaurantCard";
import { restaurants } from "@lib/constants";

/**
 * RestaurantsSection — grid of partner restaurants plus a "see all" CTA.
 */
function RestaurantsSection() {
  return (
    <section id="restaurants" className="scroll-mt-24 py-16 lg:py-24">
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <Ornament />
        <h2 className="font-display font-black text-[clamp(28px,3.6vw,40px)] text-cocoa text-center mt-4">
          مطاعم بتحكي طعمة غزة
        </h2>
        <p className="text-cocoa-soft text-center mt-3 max-w-[560px] mx-auto">
          من المشاوي عالبحر، ومن الشرقي لحلوياته — كلها بمكان واحد، بأسعار
          شفافة وتقييمات حقيقية.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.name} restaurant={restaurant} />
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#"
            className="inline-flex items-center gap-2 border-2 border-terra text-terra font-bold text-[15px] px-8 py-3.5 rounded-full hover:bg-terra/5 transition-colors"
          >
            شوف كل المطاعم +١٢٠
            <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default RestaurantsSection;
