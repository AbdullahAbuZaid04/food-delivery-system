import { Flame } from "lucide-react";
import { marqueeItems } from "@lib/constants";

/**
 * MarqueeStrip — continuous horizontal ticker between the hero and the restaurants.
 * Relies on the .marquee-track animation in globals.css; content is duplicated once
 * for a seamless loop, and the duplicate copy is hidden from screen readers.
 */
function MarqueeStrip() {
  return (
    <div className="overflow-hidden">
      <div
        className="bg-terra py-4 -rotate-[0.7deg] scale-[1.03] overflow-hidden"
        dir="ltr"
      >
        <div className="flex marquee-track w-max whitespace-nowrap">
          {marqueeItems.map((name) => (
            <span
              key={name}
              className="px-7 inline-flex items-center gap-6 text-cream font-display font-semibold text-lg"
            >
              {name}
              <Flame className="w-4 h-4 text-gold-soft" />
            </span>
          ))}
          <div aria-hidden="true" className="contents">
            {marqueeItems.map((name) => (
              <span
                key={name}
                className="px-7 inline-flex items-center gap-6 text-cream font-display font-semibold text-lg"
              >
                {name}
                <Flame className="w-4 h-4 text-gold-soft" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarqueeStrip;
