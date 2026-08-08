import { Loader2 } from "lucide-react";

export default function AuthSubmitButton({
  children,
  pending = false,
  disabled = false,
  className,
}) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={`w-full cursor-pointer inline-flex items-center justify-center gap-2 bg-terra text-cream font-bold text-[15px] py-3.5 rounded-full shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed ${
        className ?? ""
      }`}
    >
      {pending ? (
        <Loader2
          className="w-5 h-5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
