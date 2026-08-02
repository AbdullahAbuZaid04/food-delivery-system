import {
  Cake,
  Citrus,
  Flame,
  Pizza,
  Sandwich,
  UtensilsCrossed,
} from "lucide-react";
import { restaurants as landingRestaurants } from "@lib/constants";

export const RESTAURANT_CATEGORIES = [
  "الكل",
  "مشاوي وفحم",
  "مطبخ بحري",
  "بيتا وسندويشات",
  "مأكولات شعبية",
  "حلويات شرقية",
  "عصائر طازجة",
  "فلافل",
];

const CATEGORY_BY_BASE_NAME = {
  "مطعم بلدنا": "مأكولات شعبية",
  "مطعم ومسمكة البحّار": "مطبخ بحري",
  "مطعم التاج": "بيتا وسندويشات",
  "حلويات أبو السعود": "حلويات شرقية",
};

const BASE_IDS = ["baladna", "al-buhhar", "al-taj", "abu-saud"];

const BASE_FAVORITES = new Set(["al-buhhar", "abu-saud"]);

const augmentedLanding = landingRestaurants.map((restaurant, index) => {
  const id = BASE_IDS[index];
  return {
    ...restaurant,
    id,
    category: CATEGORY_BY_BASE_NAME[restaurant.name],
    isFavorite: BASE_FAVORITES.has(id),
  };
});

const extraRestaurants = [
  {
    id: "al-azli",
    icon: <Flame className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-terra/12 text-terra-dark",
    name: "مشاوي الأصيل",
    cuisine: "مشاوي وفحم",
    category: "مشاوي وفحم",
    rating: "٤٫٩",
    time: "٣٥ د",
    delivery: "مجاني فوق ٦٠ ₪",
    dishes: ["كباب مشوي", "شيش طاووق", "ريش غنم"],
    isFavorite: true,
  },
  {
    id: "roseeta-pizza",
    icon: <Pizza className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-terra",
    name: "بيتزا روزيتا",
    cuisine: "بيتزا وسندويشات",
    category: "بيتا وسندويشات",
    rating: "٤٫٧",
    time: "٣٠ د",
    delivery: "توصيل ٥ ₪",
    dishes: ["بيتزا مارغريتا", "بيتزا خضار", "سندويش فاهيتا"],
    isFavorite: false,
  },
  {
    id: "ramal-falafel",
    icon: <Sandwich className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-olive/14 text-olive",
    name: "فلافل الرمال",
    cuisine: "فلافل وحمص",
    category: "فلافل",
    rating: "٤٫٨",
    time: "١٥ د",
    delivery: "مجاني فوق ٢٥ ₪",
    dishes: ["فلافل عربي", "حمص بالطحينة", "فته حمص"],
    isFavorite: false,
  },
  {
    id: "al-birkeh",
    icon: <UtensilsCrossed className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-terra/12 text-terra",
    name: "مطعم البركة",
    cuisine: "مأكولات شعبية",
    category: "مأكولات شعبية",
    rating: "٤٫٦",
    time: "٤٠ د",
    delivery: "مجاني فوق ٧٠ ₪",
    dishes: ["مقلوبة", "كبسة دجاج", "أرز بلحمة"],
    isFavorite: false,
  },
  {
    id: "juices-al-bahr",
    icon: <Citrus className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-clay",
    name: "عصائر البحر",
    cuisine: "عصائر وكوكتيل",
    category: "عصائر طازجة",
    rating: "٤٫٨",
    time: "١٥ د",
    delivery: "توصيل ٣ ₪",
    dishes: ["عصير برتقال طازج", "كوكتيل فواكه", "عصير قصب"],
    isFavorite: false,
  },
  {
    id: "al-zaman-al-jamil",
    icon: <Cake className="w-6 h-6" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-terra-dark",
    name: "حلويات الزمن الجميل",
    cuisine: "حلويات شرقية",
    category: "حلويات شرقية",
    rating: "٤٫٩",
    time: "٢٥ د",
    delivery: "توصيل ٥ ₪",
    dishes: ["كنافة نابلسية", "زنود الست", "وربات معمول"],
    isFavorite: true,
  },
];

export const restaurants = [...augmentedLanding, ...extraRestaurants];
