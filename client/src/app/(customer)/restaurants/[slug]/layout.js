import { getRestaurantBySlug } from "@lib/api/restaurants";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  let restaurant = null;
  try {
    restaurant = await getRestaurantBySlug(slug);
  } catch {
    restaurant = null;
  }

  if (!restaurant) {
    return {
      title: "وجبة | مطعم غير موجود",
      description: "ما لقينا هالمطعم — جرب تتصفح مطاعم غزة من وجبة.",
    };
  }

  return {
    title: `وجبة | ${restaurant.name}`,
    description: `اطلب من ${restaurant.name} — ${restaurant.cuisine}، وتوصيل ضمن غزة.`,
    openGraph: {
      title: `وجبة | ${restaurant.name}`,
      description: `اطلب من ${restaurant.name} — ${restaurant.cuisine}.`,
    },
  };
}

export default async function RestaurantRouteLayout({ children, params }) {
  const { slug } = await params;

  let restaurant = null;
  try {
    restaurant = await getRestaurantBySlug(slug);
  } catch {
    restaurant = null;
  }

  const restaurantSchema = restaurant
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurant.name,
        description: restaurant.cuisine,
        servesCuisine: restaurant.cuisine,
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
