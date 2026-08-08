import { SearchX } from "lucide-react";

function EmptyState({
  onClearFilters,
  title = "ما لقينا مطاعم تطابق بحثك",
  description =
    "جرّب تفرّج على فئة تانية أو غيّر كلمة البحث — أكيد رح نلاقيلك أكلة بتجنّن.",
  actionLabel = "امسح الفلاتر",
}) {
  return (
    <div className="mt-10 md:mt-12 min-h-[320px] flex flex-col items-center justify-center rounded-[24px] border border-dashed border-clay/25 bg-cream-deep/60 px-6 py-14 text-center">
      <span className="w-16 h-16 rounded-full bg-terra/10 flex items-center justify-center">
        <SearchX className="w-8 h-8 text-terra" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <h2 className="font-display font-bold text-[20px] text-cocoa mt-5">
        {title}
      </h2>
      <p className="text-cocoa-soft text-[14.5px] mt-2 leading-relaxed max-w-sm">
        {description}
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 inline-flex items-center justify-center bg-terra text-cream font-bold text-[15px] px-7 py-3.5 rounded-full shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terra/40"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default EmptyState;
