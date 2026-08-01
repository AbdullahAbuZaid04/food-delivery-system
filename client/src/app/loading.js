import { CookingPot } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-cream flex flex-col items-center justify-center gap-5 px-4">
      <span className="w-14 h-14 rounded-full bg-terra/10 flex items-center justify-center">
        <CookingPot className="w-7 h-7 text-terra animate-pulse motion-reduce:animate-none" />
      </span>
      <p
        role="status"
        className="font-display font-semibold text-[16px] text-cocoa"
      >
        عم نجهّز طبقك…
      </p>
    </div>
  );
}
