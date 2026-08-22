import Ornament from "@components/ui/Ornament";
import { promises } from "@lib/constants";

/**
 * PromisesSection — the "ليش وجبة؟" value-proposition cards (id="promises").
 */
function PromisesSection() {
  return (
    <section id="promises" className="scroll-mt-24 py-16 lg:py-24">
      <div className="max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <Ornament />
        <h2 className="font-display font-black text-[clamp(28px,3.6vw,40px)] text-cocoa text-center mt-4">
          ليش وجبة؟
        </h2>
        <p className="text-cocoa-soft text-center mt-3 max-w-[560px] mx-auto">
          لإنه كل شي بمكان واحد، وبنظام — من طلبك لباب بيتك.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {promises.map((p, i) => (
            <div
              key={p.title}
              className={`bg-cream-deep border border-clay/10 rounded-[24px] p-8 hover:shadow-[0_24px_48px_-32px_rgba(42,36,28,0.45)] transition ${
                i % 2 !== 1 ? "lg:translate-y-5" : ""
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${p.tone}`}
              >
                {p.icon}
              </div>
              <h3 className="font-display font-semibold text-[19px] text-cocoa mt-5">
                {p.title}
              </h3>
              <p className="text-[14.5px] text-cocoa-soft leading-relaxed mt-2">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PromisesSection;
