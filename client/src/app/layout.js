import { Tajawal, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
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

export const metadata = {
  title: "وجبة | توصيل طعام فلسطيني",
  description: "اطلب أكلك المفضل من أفضل المطاعم الفلسطينية",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-tajawal antialiased">
        {children}
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
