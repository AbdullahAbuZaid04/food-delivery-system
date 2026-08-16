// Static data shared across the landing-page sections (AGENTS.md §3).
// Keep this file free of hooks — it is imported by both Server and Client components.
// When a backend/API exists, replace these arrays with fetches instead of mixing static and live data.
import {
  Store,
  Bike,
  ShieldCheck,
  Route,
  Quote,
  MessageCircle,
} from "lucide-react";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&auto=format&fit=crop";

// structured data for local SEO (Schema.org)
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "وجبة",
  url: "https://wajba.ps",
  logo: HERO_IMAGE,
  description:
    "منصة توصيل طعام من أكثر من ١٢٠ مطعم في قطاع غزة — توصيل سريع، منيو حقيقي، وأسعار شفافة.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "غزة",
    addressRegion: "قطاع غزة",
    addressCountry: "PS",
  },
  areaServed: "قطاع غزة",
};

export const marqueeItems = [
  "مشاوي وفحم",
  "مطبخ بحري",
  "بيتزا وسندويشات",
  "مأكولات شعبية",
  "حلويات شرقية",
  "عصائر طازجة",
  "فلافل",
  "آيس كريم",
];

export const steps = [
  {
    num: "١",
    title: "تختار مطعمك",
    desc: "من عشرات المطاعم المعتمَدة، بتشوف المنيو والأسعار والتقييمات قبل ما تقرر.",
  },
  {
    num: "٢",
    title: "بتحط طلبك",
    desc: "بتضيف أطباقك من مطعمك المفضّل، بتختار طريقة الدفع، وبتحط الطلب بثواني.",
  },
  {
    num: "٣",
    title: "بتتبّع طلبك لحد الباب",
    desc: "بتتابع طلبك من عالفرن لحد ما بيوصلك لباب البيت — طازج ولسّا سخن.",
  },
];

export const promises = [
  {
    icon: <Store className="w-7 h-7" strokeWidth={1.7} />,
    tone: "bg-terra/12 text-terra",
    title: "كل مطاعم غزة بمكان",
    desc: "أكتر من ١٢٠ مطعم معتمَد، منيو حقيقي وأسعار شفافة — كلها بضغطة وحدة.",
  },
  {
    icon: <Bike className="w-7 h-7" strokeWidth={1.7} />,
    tone: "bg-olive/14 text-olive",
    title: "توصيل منظّم وسريع",
    desc: "اطلب بثواني، وبتوصلك طلباتك بسرعة وبطريقة منظمة — مع تتبع لحظة بلحظة.",
  },
  {
    icon: <ShieldCheck className="w-7 h-7" strokeWidth={1.7} />,
    tone: "bg-gold/18 text-clay",
    title: "دفع آمن وضمان",
    desc: "كاش أو إلكتروني، وضمان الرضا على أول طلب من أي مطعم — من دون نقاش.",
  },
];

// 3 realistic Palestinian-flavoured testimonials for the carousel
export const testimonials = [
  {
    quote:
      "طلبت مسخّن من مطاعم عبدالله، وكنت متابعة الطلب من عالفرن لحد ما وصل لباب البيت — وصل ولسّا سخن. هيك التوصيل المنظّم بيفرّق.",
    name: "نادين خ.",
    initial: "ن",
    location: "غزة",
    year: "٢٠٢٤",
  },
  {
    quote:
      "أول مرة أطلب صيادية من مطعم ومسمكة البحّار من وجبة، والصراحة الطعم زي ما بأكل بالمطعم نفسه. التتبع لحظة بلحظة راح بالي.",
    name: "أحمد س.",
    initial: "أ",
    location: "الشجاعية",
    year: "٢٠٢٥",
  },
  {
    quote:
      "طلبت شاورما خروف من مطعم التاج ووصلت خلال ٢٠ دقيقة بالظبط — والخبزة طرية وللسّا سخنة. ما توقعت التوصيل يكون بهالسرعة برمضان.",
    name: "ليلى م.",
    initial: "ل",
    location: "الرمال",
    year: "٢٠٢٥",
  },
];

// mobile menu links with icons (rendered as tappable cards)
export const mobileMenuLinks = [
  {
    href: "#restaurants",
    icon: <Store className="w-5 h-5" />,
    label: "المطاعم",
  },
  {
    href: "#how",
    icon: <Route className="w-5 h-5" />,
    label: "كيف بتوصل؟",
  },
  {
    href: "#voice",
    icon: <Quote className="w-5 h-5" />,
    label: "كلام الزباين",
  },
  {
    href: "#contact",
    icon: <MessageCircle className="w-5 h-5" />,
    label: "كلمنا",
  },
];
