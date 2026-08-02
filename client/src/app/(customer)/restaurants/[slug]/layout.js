import { restaurants } from "@lib/mock/restaurants";
import { getRestaurantMenu } from "@lib/mock/menu";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const restaurant = restaurants.find((item) => item.id === slug);

  if (!restaurant) {
    return {
      title: "وجبة | مطعم غير موجود",
      description: "ما لقينا هالمطعم — جرب تتصفح مطاعم غزة من وجبة.",
    };
  }

  return {
    title: `وجبة | ${restaurant.name}`,
    description: `اطلب من ${restaurant.name} — ${restaurant.cuisine}، توصيل خلال ${restaurant.time}، وأسعار شفافة.`,
    openGraph: {
      title: `وجبة | ${restaurant.name}`,
      description: `اطلب من ${restaurant.name} — ${restaurant.cuisine}.`,
    },
  };
}

export default async function RestaurantRouteLayout({ children, params }) {
  const { slug } = await params;
  const restaurant = restaurants.find((item) => item.id === slug);

  const restaurantSchema = restaurant
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurant.name,
        description: restaurant.cuisine,
        servesCuisine: restaurant.category,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: restaurant.rating,
          bestRating: "5",
          reviewCount: getRestaurantMenu(slug)?.reviewsCount ?? 0,
        },
        areaServed: "قطاع غزة",
      }
    : null;

  return (
    <>
      {restaurantSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      ) : null}
      {children}
    </>
  );
}
