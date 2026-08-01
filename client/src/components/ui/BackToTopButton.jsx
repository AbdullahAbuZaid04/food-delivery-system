"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * BackToTopButton — floating button that appears after the page is scrolled.
 * Owns its own scroll listener and respects prefers-reduced-motion.
 */
function BackToTopButton() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // show the button after scrolling down the page
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة لأعلى"
      className={[
        "fixed bottom-5 left-5 z-50 w-12 h-12 rounded-full bg-terra text-cream shadow-[0_12px_28px_-8px_rgba(184,74,38,0.85)] flex items-center justify-center transition-all duration-200 hover:bg-terra-dark",
        showBackToTop ? "animate-rise" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default BackToTopButton;
