import { Search, X } from "lucide-react";

/**
 * SearchField — shared restaurant search input (icon + clear button), used in
 * the AppHeader on md+ and as a full-width mobile search on the home page.
 * The clear button keeps the 44px touch target (AGENTS.md §7).
 */
function SearchField({ value, onChange, className = "" }) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        aria-hidden="true"
        className="w-5 h-5 text-cocoa-soft absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
      />
      <input
        type="text"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="بدّك تطلب من مين؟"
        aria-label="ابحث عن مطعم"
        className="w-full rounded-full border-2 border-clay/20 bg-white/80 ps-11 pe-14 py-3 text-[14px] text-cocoa placeholder:text-cocoa-soft/70 transition-colors focus:border-terra focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="امسح البحث"
          className="absolute end-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-cocoa-soft hover:text-terra hover:bg-terra/10 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchField;
