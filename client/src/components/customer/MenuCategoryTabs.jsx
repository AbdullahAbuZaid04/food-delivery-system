"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { APP_HEADER_HEIGHT } from "@components/customer/AppHeader";

const STICKY_TABS_HEIGHT = 56;
export const MENU_STICKY_OFFSET = APP_HEADER_HEIGHT + STICKY_TABS_HEIGHT;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function MenuCategoryTabs({ categories }) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const tabRefs = useRef({});

  const scrollToCategory = useCallback((id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
  }, []);

  useEffect(() => {
    const sections = categories
      .map((category) => document.getElementById(category.id))
      .filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const closest = visible.reduce((best, entry) =>
          Math.abs(entry.boundingClientRect.top - MENU_STICKY_OFFSET) <
          Math.abs(best.boundingClientRect.top - MENU_STICKY_OFFSET)
            ? entry
            : best,
        );
        setActiveId(closest.target.id);
      },
      { rootMargin: `-${MENU_STICKY_OFFSET}px 0px -60% 0px`, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const tab = tabRefs.current[activeId];
    if (!tab) return;
    tab.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  const handleTabListKeyDown = (event) => {
    const currentIndex = categories.findIndex(
      (category) => category.id === activeId,
    );
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = currentIndex + 1;
    else if (event.key === "ArrowRight") nextIndex = currentIndex - 1;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = categories.length - 1;
    else return;

    event.preventDefault();
    const clamped = (nextIndex + categories.length) % categories.length;
    const next = categories[clamped];
    setActiveId(next.id);
    scrollToCategory(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div
      className="sticky z-30 bg-cream/95 backdrop-blur-md border-b border-clay/10"
      style={{ top: APP_HEADER_HEIGHT }}
    >
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <div
          role="tablist"
          aria-label="فئات المنيو"
          onKeyDown={handleTabListKeyDown}
          className="flex gap-2 overflow-x-auto scrollbar-hide h-14 items-center"
        >
          {categories.map((category) => {
            const isActive = category.id === activeId;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  tabRefs.current[category.id] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={category.id}
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  setActiveId(category.id);
                  scrollToCategory(category.id);
                }}
                className={`h-11 shrink-0 rounded-full px-5 text-[14px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 ${
                  isActive
                    ? "bg-terra text-cream shadow-[0_8px_20px_-8px_rgba(184,74,38,0.7)]"
                    : "bg-white border border-clay/20 text-cocoa-soft hover:border-terra/40 hover:text-terra"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MenuCategoryTabs;
