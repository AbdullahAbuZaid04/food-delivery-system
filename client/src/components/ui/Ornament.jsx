import { Leaf } from "lucide-react";

/**
 * Ornament — decorative divider: a leaf between two lines.
 * @param {boolean} [light=false] - use light-cream line/gold leaf tones for dark sections.
 */
function Ornament({ light = false }) {
  const line = light ? "bg-cream/30" : "bg-clay/30";
  const color = light ? "text-gold-soft" : "text-terra";
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className={`h-px w-10 ${line}`} />
      <Leaf className={`w-4 h-4 ${color}`} />
      <span className={`h-px w-10 ${line}`} />
    </div>
  );
}

export default Ornament;
