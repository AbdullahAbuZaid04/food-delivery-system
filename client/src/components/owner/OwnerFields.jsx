// Shared form primitives for the owner dashboard. Same tokens as the rest of
// the product (AGENTS.md §4) — labels on top, 44px-tall controls for touch.
export const inputClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export function Field({ label, required, hint, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-bold text-foreground"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-error">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

export function NumberInput({ className = "", ...props }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={`${inputClass} ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea className={`${inputClass} min-h-24 resize-y ${className}`} {...props} />
  );
}

export function Select({ className = "", options, ...props }) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-error/30 px-5 text-sm font-bold text-error transition-colors hover:border-error hover:bg-error/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-error/40 disabled:pointer-events-none disabled:opacity-60";
