import { CookingPot } from "lucide-react";

/**
 * BrandMark — the وجبة brand glyph shown next to the wordmark.
 */
function BrandMark() {
  return (
    <span className="w-9 h-9 rounded-full bg-terra/10 flex items-center justify-center">
      <CookingPot className="w-5 h-5 text-terra" />
    </span>
  );
}

export default BrandMark;
