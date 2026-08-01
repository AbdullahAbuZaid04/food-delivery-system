export default function AuthSubmitButton({ children, className }) {
  return (
    <button
      type="submit"
      className={`w-full cursor-pointer inline-flex items-center justify-center gap-2 bg-terra text-cream font-bold text-[15px] py-3.5 rounded-full shadow-[0_12px_28px_-10px_rgba(184,74,38,0.8)] hover:bg-terra-dark transition-colors active:translate-y-px ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}
