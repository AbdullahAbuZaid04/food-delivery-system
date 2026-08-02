import Ornament from "@components/ui/Ornament";

function GreetingBanner({ userName }) {
  return (
    <section className="mt-6 md:mt-10">
      <Ornament />
      <h1 className="font-display font-black text-[clamp(26px,3.4vw,38px)] leading-snug text-cocoa text-center mt-4">
        أهلًا {userName}
      </h1>
      <p className="text-cocoa-soft text-[15px] sm:text-base text-center mt-2">
        شو ناوي تطلب اليوم؟
      </p>
    </section>
  );
}

export default GreetingBanner;
