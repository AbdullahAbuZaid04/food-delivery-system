import Header from "@components/layout/Header";
import Hero from "@components/sections/Hero";
import MarqueeStrip from "@components/sections/MarqueeStrip";
import RestaurantsSection from "@components/sections/RestaurantsSection";
import HowItWorksSection from "@components/sections/HowItWorksSection";
import PromisesSection from "@components/sections/PromisesSection";
import TestimonialsCarousel from "@components/sections/TestimonialsCarousel";
import Footer from "@components/layout/Footer";
import BackToTopButton from "@components/ui/BackToTopButton";
import { organizationSchema } from "@lib/constants";

export default function HomePage() {
  return (
    <div className="grain min-h-screen w-full bg-cream text-cocoa font-tajawal overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Header />
      <main>
        <Hero />
        <MarqueeStrip />
        <RestaurantsSection />
        <HowItWorksSection />
        <PromisesSection />
        <TestimonialsCarousel />
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
