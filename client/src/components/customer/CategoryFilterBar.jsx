"use client";

function CategoryFilterBar({
  categories,
  activeCategory,
  onSelect,
  srOnlyTitle = "فئات المطاعم",
  ariaLabel = "فلترة المطاعم حسب الفئة",
}) {
  return (
    <div className="mt-6 md:mt-8">
      <h2 className="sr-only">{srOnlyTitle}</h2>
      <div
        role="group"
        aria-label={ariaLabel}
        className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 px-4 sm:px-6 py-1"
      >
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              aria-pressed={isActive}
              className={`h-11 shrink-0 rounded-full px-5 text-[14px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40 ${
                isActive
                  ? "bg-terra text-cream shadow-[0_8px_20px_-8px_rgba(184,74,38,0.7)]"
                  : "bg-white border border-clay/20 text-cocoa-soft hover:border-terra/40 hover:text-terra"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilterBar;
