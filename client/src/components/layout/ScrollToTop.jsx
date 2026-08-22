"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollTop = () => {
      const html = document.documentElement;
      const previous = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      html.style.scrollBehavior = previous;
    };

    scrollTop();
    const frame = requestAnimationFrame(scrollTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
