import Ornament from "@components/ui/Ornament";
import { steps } from "@lib/constants";

/**
 * HowItWorksSection — three-step band on a dark olive background (id="how").
 */
function HowItWorksSection() {
  return (
    <section
      id="how"
      className="scroll-mt-24 bg-olive-deep py-16 lg:py-24 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-olive/25 blur-[90px]" />
      <div className="relative max-w-[1180px] xl:max-w-[1280px] mx-auto px-4 sm:px-6">
        <Ornament light />
        <h2 className="font-display font-black text-[clamp(28px,3.6vw,40px)] text-cream text-center mt-4">
          من المطاعم لباب البيت، بثلاث خطوات
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`bg-olive/25 border border-cream/10 rounded-[24px] p-8 text-center ${
                i % 2 === 1 ? "lg:translate-y-5" : ""
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-terra text-cream font-display font-bold text-2xl flex items-center justify-center ring-4 ring-gold/30">
                {step.num}
              </div>
              <h3 className="font-display font-semibold text-[19px] text-cream mt-5">
                {step.title}
              </h3>
              <p className="text-[14.5px] text-cream/70 leading-relaxed mt-2">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
