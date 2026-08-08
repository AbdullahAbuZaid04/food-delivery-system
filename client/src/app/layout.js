import { Tajawal, Inter, Cairo } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "@components/layout/ScrollToTop";
import { CartProvider } from "@context/CartContext";
import { AuthProvider } from "@context/AuthContext";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const OG_IMAGE =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80";

export const metadata = {
  metadataBase: new URL("https://wajba.ps"),
  title: "وجبة | توصيل طعام فلسطيني في غزة",
  description:
    "اطلب من أكثر من ١٢٠ مطعم في غزة. توصيل سريع، منيو حقيقي، وأسعار شفافة.",
  openGraph: {
    type: "website",
    locale: "ar_PS",
    siteName: "وجبة",
    title: "وجبة | توصيل طعام فلسطيني في غزة",
    description:
      "اطلب من أكثر من ١٢٠ مطعم في غزة. توصيل سريع، منيو حقيقي، وأسعار شفافة.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "وجبة — توصيل الطعام في غزة" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "وجبة | توصيل طعام فلسطيني في غزة",
    description:
      "اطلب من أكثر من ١٢٠ مطعم في غزة. توصيل سريع، منيو حقيقي، وأسعار شفافة.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${tajawal.variable} ${inter.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-tajawal antialiased">
        <ScrollToTop />
        <CartProvider>
          <AuthProvider>{children}</AuthProvider>
        </CartProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "var(--font-tajawal)",
              direction: "rtl",
              borderRadius: "12px",
              padding: "12px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}
